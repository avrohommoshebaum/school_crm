/**
 * Setup Email Schema
 * Creates email_messages and scheduled_emails tables if they don't exist
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupEmailSchema() {
  try {
    // Check if tables already exist
    const checkResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('email_messages', 'scheduled_emails')
    `);

    const existingTables = checkResult.rows.map((row) => row.table_name);
    const allTablesExist = existingTables.includes("email_messages") && existingTables.includes("scheduled_emails");

    if (allTablesExist) {
      console.log("✅ Email schema tables already exist");
      return;
    }

    console.log("📋 Setting up Email schema (creating missing tables)...");

    // Read and execute schema SQL
    const schemaPath = join(__dirname, "..", "schema_email.sql");
    const schemaSQL = readFileSync(schemaPath, "utf-8");

    // Execute schema SQL
    // PostgreSQL's IF NOT EXISTS will handle existing tables gracefully
    try {
      await query(schemaSQL);
      console.log("✅ Email schema setup complete!");
    } catch (error) {
      // If error is about objects already existing, that's okay
      if (error.message && (error.message.includes("already exists") || error.code === "42P07" || error.code === "42710")) {
        console.log("⚠️ Some objects already exist (this is okay)");
        return;
      }
      // Re-throw other errors
      throw error;
    }
  } catch (error) {
    // If error is about tables already existing, that's okay
    if (error.message && (error.message.includes("already exists") || error.code === "42P07" || error.code === "42710")) {
      console.log("⚠️ Some tables already exist, continuing...");
      return;
    }
    console.error("❌ Error setting up Email schema:", error.message);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupEmailSchema()
    .then(() => {
      console.log("✅ Done");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Failed:", error);
      process.exit(1);
    });
}

export default setupEmailSchema;

