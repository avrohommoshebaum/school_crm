/**
 * Extended Schema Setup Script
 * 
 * This script creates the extended database schema (students, parents, staff, classes, etc.)
 * 
 * Usage:
 *   node server/db/setupExtendedSchema.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFileSync } from "fs";
import { initializePostgres, query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, "../../.env") });

async function setupExtendedSchema() {
  try {
    console.log("🚀 Setting up extended PostgreSQL database schema...\n");
    
    // Initialize connection
    await initializePostgres();
    
    // Read extended schema SQL file
    const schemaPath = join(__dirname, "../schema_extended.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");
    
    // Execute the entire schema SQL file
    console.log("📝 Executing extended schema SQL...\n");
    
    try {
      await query(schemaSQL);
      console.log("✅ Extended schema SQL executed successfully");
    } catch (error) {
      // If error is about existing objects, that's okay (idempotent)
      if (error.code === "42P07" || error.code === "42710" || error.message.includes("already exists")) {
        console.log("⚠️  Some objects already exist (this is okay if re-running)");
      } else {
        console.error(`\n❌ Error executing extended schema:`, error.message);
        throw error;
      }
    }
    
    console.log("\n✅ Extended database schema created successfully!");
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
    
    console.log("\n✅ Extended schema setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Extended schema setup failed:", error);
    process.exit(1);
  }
}

setupExtendedSchema();

