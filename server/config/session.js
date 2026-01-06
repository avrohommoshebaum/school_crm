// config/session.js
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { getPostgresPool } from "../db/postgresConnect.js";

const isProd = process.env.NODE_ENV === "production";

const PgSession = connectPgSimple(session);

// Get session timeout from env or Secret Manager, default to 30 minutes
export function getSessionTimeout() {
  // Try to get from env first (for local dev or if set in env)
  const envTimeout = process.env.SESSION_TIMEOUT_MS;
  if (envTimeout) {
    return parseInt(envTimeout, 10);
  }
  
  // Default to 30 minutes in milliseconds (if SESSION_SECRET not loaded from Secret Manager)
  // This is a safety default for when secrets aren't properly configured
  return 1000 * 60 * 30; // 30 minutes
}

export default async function configureSession(app) {
  // Get PostgreSQL pool (will initialize if needed)
  const pool = await getPostgresPool();
  
  if (!pool) {
    throw new Error("PostgreSQL connection pool not initialized");
  }

  const sessionTimeout = getSessionTimeout();

  app.use(
    session({
      proxy: true,
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: isProd,                 // ✅ only secure in prod
        sameSite: "lax",            // ✅ helps against CSRF
        maxAge: sessionTimeout, // Use the function
      },
      store: new PgSession({
        pool: pool,
        tableName: "sessions", // Name of the table in PostgreSQL
        createTableIfMissing: false, // We create it via schema.sql
      }),
    })
  );
}
