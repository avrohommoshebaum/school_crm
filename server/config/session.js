// config/session.js
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { getPostgresPool } from "../db/postgresConnect.js";

const isProd = process.env.NODE_ENV === "production";

const PgSession = connectPgSimple(session);

export default async function configureSession(app) {
  // Get PostgreSQL pool (will initialize if needed)
  const pool = await getPostgresPool();
  
  if (!pool) {
    throw new Error("PostgreSQL connection pool not initialized");
  }

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
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
      store: new PgSession({
        pool: pool,
        tableName: "sessions", // Name of the table in PostgreSQL
        createTableIfMissing: false, // We create it via schema.sql
      }),
    })
  );
}
