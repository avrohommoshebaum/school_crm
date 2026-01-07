/**
 * Setup Principal Center Schema
 * Creates tables for principal overviews and grade assignments
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupPrincipalCenterSchema() {
  try {
    // Read the schema file
    const schemaPath = join(__dirname, "..", "schema_principal_center.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");

    // Execute the schema
    try {
      await query(schemaSQL);
    } catch (error) {
      // If error is about existing objects, that's okay (idempotent)
      if (error.code === "42P07" || error.code === "42710" || error.message.includes("already exists")) {
        // Schema already exists - this is fine
        return;
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Error setting up Principal Center schema:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPrincipalCenterSchema()
    .then(() => {
      console.log("✅ Principal Center schema setup complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Setup failed:", error);
      process.exit(1);
    });
}

export default setupPrincipalCenterSchema;

