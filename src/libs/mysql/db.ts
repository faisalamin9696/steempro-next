import mysql, { Pool } from "mysql2/promise";
import { Client, ConnectConfig } from "ssh2";

// SSH and MySQL configuration
const sshConfig: ConnectConfig = {
  host: process.env.MYSQL_SSH_HOST as string,
  port: parseInt(process.env.MYSQL_SSH_PORT as string, 10),
  username: process.env.MYSQL_SSH_USERNAME as string,
  password: process.env.MYSQL_SSH_PASSWORD as string,
};

const dbConfig = {
  host: process.env.MYSQL_DB_HOST as string,
  port: parseInt(process.env.MYSQL_DB_PORT as string, 10),
  user: process.env.MYSQL_DB_USERNAME as string,
  password: process.env.MYSQL_DB_PASSWORD as string,
};

// Global variables for managing pool and SSH client
let poolMap: Map<string, Pool> = new Map(); // To handle multiple pools for different databases
let sshClient: Client | null = null;
let tunnel: any;
let connectionTimeout: NodeJS.Timeout;

// Function to create an SSH tunnel
async function createTunnel(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (sshClient && sshClient.readyState === "open") {
      console.log("SSH tunnel is already connected");
      resolve();
      return;
    }

    sshClient = new Client();
    sshClient
      .on("ready", () => {
        sshClient!.forwardOut(
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
            console.log("SSH tunnel established");
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

// Function to create a connection pool for a specific MySQL database
async function createPool(dbName: string): Promise<Pool> {
  try {
    await createTunnel();
    const newPool = mysql.createPool({
      ...dbConfig,
      stream: tunnel,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 6,
      connectTimeout: 30000,
    });
    console.log(`Connection pool created for database: ${dbName}`);

    poolMap.set(dbName, newPool); // Store pool in the map
    return newPool;
  } catch (error) {
    console.error("Error creating connection pool:", error);
    throw error;
  }
}

// Get the MySQL connection pool, creating it if it doesn't exist
async function getPool(dbName: string): Promise<Pool> {
  // Check if the pool for the specific database is already created
  if (poolMap.has(dbName)) {
    console.log(`Reusing existing connection pool for database: ${dbName}`);
    resetConnectionTimeout();
    return poolMap.get(dbName) as Pool;
  }

  // Create a new pool if it doesn't exist
  return createPool(dbName);
}

// Close the MySQL connection pool and SSH tunnel after 5 minutes of inactivity
async function closePool(): Promise<void> {
  try {
    // Close all connection pools
    poolMap.forEach(async (pool, dbName) => {
      await pool.end();
      console.log(`MySQL connection pool closed for database: ${dbName}`);
    });
    poolMap.clear();

    // Close the SSH client
    if (sshClient) {
      sshClient.end();
      sshClient = null;
      console.log("SSH tunnel closed");
    }
  } catch (error) {
    console.error("Error closing connection pool:", error);
  }
}
// Reset the connection timeout (auto-closes after 5 minutes)
function resetConnectionTimeout() {
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
  }

  connectionTimeout = setTimeout(async () => {
    console.log("Closing pool and tunnel due to inactivity");
    await closePool();
  }, 5 * 60 * 1000); // 5 minutes
}

// Execute a query on the MySQL database
async function executeQuery(
  dbName: string = "",
  query: string,
  params?: any[]
): Promise<any> {
  let connection: mysql.PoolConnection | undefined;
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
  }
}

// Exports for usage in other files
export { getPool, closePool, executeQuery };
