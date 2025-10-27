import mysql, { Pool } from "mysql2/promise";

// MySQL configuration
const dbConfig = {
  host: process.env.MYSQL_DB_HOST as string,
  port: parseInt(process.env.MYSQL_DB_PORT as string, 10),
  user: process.env.MYSQL_DB_USERNAME as string,
  password: process.env.MYSQL_DB_PASSWORD as string,
};

// Global variable for managing pools
let poolMap: Map<string, Pool> = new Map();
let connectionTimeout: NodeJS.Timeout;

// Function to create a connection pool for a specific MySQL database
async function _createPool(dbName: string): Promise<Pool> {
  try {
    const newPool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 6,
      connectTimeout: 30000,
    });

    // Test the connection
    const connection = await newPool.getConnection();
    console.log(`✅ MySQL connected to database: ${dbName}`);
    connection.release();

    poolMap.set(dbName, newPool);
    return newPool;
  } catch (error) {
    console.error("❌ Error creating connection pool:", error);
    throw error;
  }
}

// Get the MySQL connection pool, creating it if it doesn't exist
async function getPool(dbName: string): Promise<Pool> {
  // Check if the pool for the specific database is already created
  if (poolMap.has(dbName)) {
    console.log(`♻️ Reusing existing connection pool for database: ${dbName}`);
    resetConnectionTimeout();
    return poolMap.get(dbName) as Pool;
  }

  // Create a new pool if it doesn't exist
  return _createPool(dbName);
}

// Close the MySQL connection pool after 5 minutes of inactivity
async function closePool(): Promise<void> {
  try {
    // Close all connection pools
    const closePromises = Array.from(poolMap.entries()).map(
      async ([dbName, pool]) => {
        await pool.end();
        console.log(`🔌 MySQL connection pool closed for database: ${dbName}`);
      }
    );

    await Promise.all(closePromises);
    poolMap.clear();
    console.log("✅ All MySQL connection pools closed");
  } catch (error) {
    console.error("❌ Error closing connection pools:", error);
  }
}

// Reset the connection timeout (auto-closes after 5 minutes)
function resetConnectionTimeout(): void {
  if (connectionTimeout) {
    clearTimeout(connectionTimeout);
  }

  connectionTimeout = setTimeout(async () => {
    console.log("⏰ Closing pools due to inactivity (5 minutes)");
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
    console.error("❌ Error executing query:", error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Test database connection
async function testConnection(dbName: string = ""): Promise<boolean> {
  try {
    const pool = await getPool(dbName);
    const connection = await pool.getConnection();
    const [result] = await connection.query("SELECT 1 as test");
    connection.release();
    console.log("✅ Database connection test successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection test failed:", error);
    return false;
  }
}

// Get database connection status
function getConnectionStatus(): { [dbName: string]: string } {
  const status: { [dbName: string]: string } = {};

  poolMap.forEach((pool, dbName) => {
    // Method 1: Check if pool has connections
    if (pool && typeof pool.getConnection === "function") {
      status[dbName] = "connected";
    } else {
      status[dbName] = "disconnected";
    }
  });

  return status;
}

// Graceful shutdown handler
process.on("SIGINT", async () => {
  console.log("🛑 Received SIGINT, closing database connections...");
  await closePool();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 Received SIGTERM, closing database connections...");
  await closePool();
  process.exit(0);
});

// Exports for usage in other files
export {
  getPool,
  closePool,
  executeQuery,
  testConnection,
  getConnectionStatus,
};
