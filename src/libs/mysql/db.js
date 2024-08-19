const mysql = require("mysql2/promise");
const { Client } = require("ssh2");

// SSH and MySQL configuration
const sshConfig = {
  host: process.env.MYSQL_SSH_HOST, // SSH server address
  port: process.env.MYSQL_SSH_PORT, // SSH port
  username: process.env.MYSQL_SSH_USERNAME, // SSH username
  password: process.env.MYSQL_SSH_PASSWORD, // SSH password
};

const dbConfig = {
  host: process.env.MYSQL_DB_HOST, // localhost for SSH tunnel
  port: process.env.MYSQL_DB_PORT, // MySQL port
  user: process.env.MYSQL_DB_USERNAME, // MySQL username
  password: process.env.MYSQL_DB_PASSWORD, // MySQL password
  // database: process.env.MYSQL_DB_DATABASE, // MySQL database name
};

let pool;
let sshClient;
let tunnel;

async function createTunnel() {
  return new Promise((resolve, reject) => {
    sshClient = new Client();
    sshClient
      .on("ready", () => {
        sshClient.forwardOut(
          "127.0.0.1",
          dbConfig.port,
          dbConfig.host,
          dbConfig.port,
          (err, stream) => {
            if (err) {
              console.error("Error forwarding SSH tunnel:", err);
              reject(err);
            }
            tunnel = stream;
            resolve();
          }
        );
      })
      .connect(sshConfig);

    sshClient.on("error", (err) => {
      console.error("SSH Client Error:", err);
      reject(err);
    });
  });
}

async function createPool(dbName) {
  try {
    await createTunnel();
    pool = mysql.createPool({
      ...dbConfig,
      stream: tunnel,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 120,
    });
    console.log("Connection pool created");

    return pool;
  } catch (error) {
    console.error("Error creating connection pool:", error);
    throw error;
  }
}

async function getPool(dbName) {
  if (!pool) {
    pool = await createPool(dbName);
  }
  return pool;
}

async function closePool() {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      console.log("MySQL connection pool closed");
    }
    if (sshClient) {
      sshClient.end();
      sshClient = null;
      console.log("SSH tunnel closed");
    }
  } catch (error) {
    console.error("Error closing connection pool:", error);
  }
}

async function executeQuery(dbName, query, params) {
  let connection;
  try {
    const pool = await getPool(dbName);
    connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  } finally {
    if (connection) connection.release();
    await closePool();
  }
}

module.exports = {
  getPool,
  closePool,
  executeQuery,
};
