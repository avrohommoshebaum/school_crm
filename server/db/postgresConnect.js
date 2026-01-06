import pg from "pg";
const { Pool } = pg;

let pool = null;

/**
 * Helper to access secrets from Google Secret Manager (only in production)
 */
async function getSecret(secretName) {
  if (process.env.NODE_ENV !== "production") {
    return process.env[secretName];
  }
  
  try {
    const { SecretManagerServiceClient } = await import("@google-cloud/secret-manager");
    const client = new SecretManagerServiceClient();
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || "credible-runner-468819-f9";
    
    const [version] = await client.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });
    
    return version.payload.data.toString();
  } catch (error) {
    // Fall back to environment variable
    return process.env[secretName];
  }
}

/**
 * Initialize PostgreSQL connection pool
 */
export async function initializePostgres() {
  if (pool) {
    return pool;
  }

  try {
    // Get database credentials from environment or secrets
    let config = {};

    if (process.env.NODE_ENV === "production") {
      // In production, try to get from Google Secret Manager
      let dbHost = await getSecret("DB_HOST") || process.env.DB_HOST;
      const dbPort = await getSecret("DB_PORT") || process.env.DB_PORT;
      const dbName = await getSecret("DB_NAME") || process.env.DB_NAME;
      const dbUser = await getSecret("DB_USER") || process.env.DB_USER;
      const dbPassword = await getSecret("DB_PASSWORD") || process.env.DB_PASSWORD;

      // Check if DB_HOST is a Cloud SQL connection name (PROJECT:REGION:INSTANCE)
      // If so, convert it to Unix socket path for Cloud Run
      const isUnixSocket = dbHost && dbHost.startsWith('/cloudsql/');
      const isCloudSQLConnectionName = dbHost && dbHost.includes(':') && !dbHost.startsWith('/') && !dbHost.match(/^\d+\.\d+\.\d+\.\d+$/);
      
      if (isCloudSQLConnectionName) {
        // This looks like a Cloud SQL connection name (PROJECT:REGION:INSTANCE)
        // Convert to Unix socket path for Cloud Run
        // Note: You must also add --add-cloudsql-instances to your Cloud Run deploy command
        dbHost = `/cloudsql/${dbHost}`;
        console.log(`🔧 Converting Cloud SQL connection name to Unix socket: ${dbHost}`);
      }

      config = {
        host: dbHost,
        // Unix sockets don't use ports, but pg library will ignore it if host is a socket path
        port: parseInt(dbPort || "5432"),
        database: dbName,
        user: dbUser,
        password: dbPassword,
        // Unix sockets don't use SSL, TCP/IP connections do
        ssl: (isUnixSocket || dbHost?.startsWith('/cloudsql/')) ? false : {
          rejectUnauthorized: false, // For Cloud SQL IP connections
        },
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout for Cloud SQL
      };
      
      console.log(`🔧 Database config: host=${dbHost}, port=${config.port}, database=${dbName}, user=${dbUser}, ssl=${config.ssl ? 'enabled' : 'disabled'}`);
    } else {
      // Local development or when connecting to Cloud SQL from local machine
      const useSSL = process.env.DB_SSL === "true" || process.env.DB_HOST?.includes("googleapis.com") || process.env.DB_HOST?.match(/^\d+\.\d+\.\d+\.\d+$/);
      
      config = {
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT || "5432"),
        database: process.env.DB_NAME || "school_app",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
        ssl: useSSL ? {
          rejectUnauthorized: false, // Required for Cloud SQL public IP
        } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000, // Increased timeout for Cloud SQL
      };
    }

    // Validate required config
    if (!config.host || !config.database || !config.user || !config.password) {
      throw new Error(
        "Database configuration is incomplete. Please set DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD environment variables."
      );
    }

    pool = new Pool(config);

    // Test connection
    const client = await pool.connect();
    try {
      await client.query("SELECT NOW()");
      // Connected to PostgreSQL database
    } finally {
      client.release();
    }

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("❌ Unexpected error on idle PostgreSQL client", err);
    });

    return pool;
  } catch (error) {
    console.error("❌ Error connecting to PostgreSQL:", error);
    throw error;
  }
}

/**
 * Get the PostgreSQL connection pool
 */
export async function getPostgresPool() {
  if (!pool) {
    await initializePostgres();
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query(text, params) {
  const pool = await getPostgresPool();
  return pool.query(text, params);
}

/**
 * Get a client from the pool (for transactions)
 */
export async function getClient() {
  const pool = await getPostgresPool();
  return pool.connect();
}

// Export pool for use by session store (after initialization)
export { pool };

export default { initializePostgres, getPostgresPool, query, getClient, pool };

