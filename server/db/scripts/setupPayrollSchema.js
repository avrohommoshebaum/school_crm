/**
 * Setup Payroll Schema
 * Creates payroll tables for comprehensive staff payroll tracking
 */

import { query } from "../postgresConnect.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function setupPayrollSchema() {
  try {
    const schemaPath = join(__dirname, "../schema_payroll.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");

    // Remove comments and split by semicolon, but be smarter about it
    let cleanedSQL = schemaSQL
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    // Split by semicolon, but keep multi-line statements together
    const statements = cleanedSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    let successCount = 0;
    let errorCount = 0;

    for (const statement of statements) {
      if (statement.trim() && statement.trim().length > 10) {
        try {
          await query(statement + ";");
          successCount++;
        } catch (error) {
          // Ignore "already exists" errors and function already exists
          const errorMsg = error.message || "";
          const errorCode = error.code || "";
          
          if (
            errorMsg.includes("already exists") ||
            errorMsg.includes("duplicate") ||
            errorCode === "42P07" || // duplicate_table
            errorCode === "42710" || // duplicate_object
            (errorMsg.includes("does not exist") && errorCode === "42883") // function does not exist (for trigger)
          ) {
            // These are expected - continue
            successCount++;
          } else {
            errorCount++;
            console.error("⚠️  Error executing payroll schema statement:", errorMsg);
            console.error("   Code:", errorCode);
            console.error("   Statement:", statement.substring(0, 150) + "...");
          }
        }
      }
    }

    if (errorCount === 0) {
      console.log(`✅ Payroll schema setup completed (${successCount} statements)`);
    } else {
      console.log(`⚠️  Payroll schema setup completed with ${errorCount} errors (${successCount} statements succeeded)`);
    }
  } catch (error) {
    console.error("❌ Error setting up payroll schema:", error.message);
    // Don't exit - allow server to continue
    if (import.meta.url === `file://${process.argv[1]}`) {
      process.exit(1);
    }
  }
}

// If run directly, execute setup
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPayrollSchema()
    .then(() => {
      console.log("Payroll schema setup complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Failed to setup payroll schema:", error);
      process.exit(1);
    });
}

