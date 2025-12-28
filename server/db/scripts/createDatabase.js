/**
 * Create Database Script
 * 
 * This script creates the database if it doesn't exist.
 * 
 * Usage:
 *   node server/db/createDatabase.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";
const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function createDatabase() {
  try {
    console.log("🚀 Creating database...\n");
    
    const dbName = process.env.DB_NAME || "school_app";
    
    // Connect to default 'postgres' database to create the new database
    const adminConfig = {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: "postgres", // Connect to default database
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
    };
    
    const adminPool = new Pool(adminConfig);
    
    try {
      // Check if database exists
      const checkResult = await adminPool.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );
      
      if (checkResult.rows.length > 0) {
        console.log(`✅ Database "${dbName}" already exists`);
      } else {
        // Create database
        await adminPool.query(`CREATE DATABASE ${dbName}`);
        console.log(`✅ Database "${dbName}" created successfully`);
      }
    } finally {
      await adminPool.end();
    }
    
    console.log("\n✅ Database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database creation failed:", error.message);
    process.exit(1);
  }
}

createDatabase();

