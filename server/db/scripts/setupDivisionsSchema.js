/**
 * Setup Divisions Schema
 * Creates tables for divisions, division_grades, and principal_division_assignments
 */

import { query } from "../postgresConnect.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function setupDivisionsSchema() {
  try {
    // Read the schema file
    const schemaPath = join(__dirname, "../schema_divisions.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");

    // Execute the schema
    await query(schemaSQL);

    console.log("✅ Divisions schema setup completed");
    return true;
  } catch (error) {
    // If tables already exist, that's fine
    if (error.code === "42P07" || error.message.includes("already exists")) {
      console.log("ℹ️  Divisions schema already exists, skipping...");
      return true;
    }
    
    // Re-throw other errors
    console.error("❌ Error setting up divisions schema:", error);
    throw error;
  }
}
