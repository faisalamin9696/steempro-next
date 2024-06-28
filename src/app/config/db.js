const mysql = require("mysql2/promise");
const { Client } = require("ssh2");

// SSH and MySQL configuration
const sshConfig = {
  host: process.env.NEXT_SSH_HOST, // SSH server address
  port: process.env.NEXT_SSH_PORT, // SSH port
  username: process.env.NEXT_SSH_USERNAME, // SSH username
  password: process.env.NEXT_SSH_PASSWORD, // SSH password
};

const dbConfig = {
  host: process.env.NEXT_DB_HOST, // localhost for SSH tunnel
  port: process.env.NEXT_DB_PORT, // MySQL port
  user: process.env.NEXT_DB_USERNAME, // MySQL username
  password: process.env.NEXT_DB_PASSWORD, // MySQL password
  database: process.env.NEXT_DB_DATABASE, // MySQL database name
};
let connection;
let sshClient;
let tunnel;

async function createTunnel() {
  return new Promise((resolve, reject) => {
    sshClient = new Client();
    sshClient
      .on("ready", () => {
        sshClient.forwardOut(
          "127.0.0.1",
          3306,
          dbConfig.host,
          dbConfig.port,
          (err, stream) => {
            if (err) reject(err);
            tunnel = stream;
            resolve();
          }
        );
      })
      .connect(sshConfig);

    sshClient.on("error", (err) => {
      reject(err);
    });
  });
}

async function createConnection() {
  try {
    await createTunnel();
    connection = await mysql.createConnection({
      ...dbConfig,
      stream: tunnel,
    });
    console.log("Connected to the MySQL database through SSH tunnel");
    return connection;
  } catch (error) {
    console.error("Error creating connection:", error);
    throw error;
  }
}

async function getConnection() {
  if (!connection) {
    connection = await createConnection();
  }
  return connection;
}

async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
    console.log("MySQL connection closed");
  }
  if (sshClient) {
    sshClient.end();
    sshClient = null;
    console.log("SSH tunnel closed");
  }
}

async function executeQuery(query, params) {
  return new Promise(async (resolve, reject) => {
    try {
      const connection = await getConnection();
      const [rows] = await connection.query(query, params);
      resolve(rows);
    } catch (error) {
      reject(error);
    } finally {
      await closeConnection();
    }
  });
}
module.exports = {
  getConnection,
  closeConnection,
  executeQuery,
};
