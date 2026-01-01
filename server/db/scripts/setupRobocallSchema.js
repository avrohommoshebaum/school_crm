/**
 * Setup Robocall Schema
 * Creates robocall-related tables if they don't exist
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { query } from "../postgresConnect.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function setupRobocallSchema() {
  try {
    const schemaPath = join(__dirname, "../schema_robocall.sql");
    const schemaSQL = readFileSync(schemaPath, "utf8");

    // Execute schema SQL
    await query(schemaSQL);

    console.log("✅ Robocall schema setup complete");
  } catch (error) {
    // If tables already exist, that's okay
    if (error.message.includes("already exists")) {
      console.log("ℹ️ Robocall tables already exist");
      return;
    }
    throw error;
  }
}

