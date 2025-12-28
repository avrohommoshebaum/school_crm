/**
 * Database Setup Script
 * 
 * This script creates the database schema by reading and executing schema.sql
 * 
 * Usage:
 *   node server/db/setupDatabase.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { initializePostgres, query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function setupDatabase() {
  try {
    console.log("🚀 Setting up PostgreSQL database schema...\n");
    
    // Initialize connection
    await initializePostgres();
    
    // Read schema SQL file
    const schemaPath = join(__dirname, "../schema.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");
    
    // Execute the entire schema SQL file
    // PostgreSQL can handle multiple statements in a single query
    console.log("📝 Executing schema SQL...\n");
    
    try {
      await query(schemaSQL);
      console.log("✅ Schema SQL executed successfully");
    } catch (error) {
      // If error is about existing objects, that's okay (idempotent)
      if (error.code === "42P07" || error.code === "42710" || error.message.includes("already exists")) {
        console.log("⚠️  Some objects already exist (this is okay if re-running)");
      } else {
        console.error(`\n❌ Error executing schema:`, error.message);
        throw error;
      }
    }
    
    console.log("\n\n✅ Database schema created successfully!");
    console.log("\n📊 Verifying tables...\n");
    
    // Verify tables were created
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log("Created tables:");
    tables.rows.forEach(row => {
      console.log(`  ✓ ${row.table_name}`);
    });
    
    console.log("\n✅ Setup complete! You can now run the migration script.");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Database setup failed:", error);
    process.exit(1);
  }
}

setupDatabase();

