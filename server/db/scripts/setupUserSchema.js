/**
 * Setup User Schema - Adds missing columns to users table
 * This runs automatically on server startup
 */

import { query } from "../postgresConnect.js";

export default async function setupUserSchema() {
  try {
    // Check if last_login column exists
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'last_login'
    `);

    if (checkResult.rows.length === 0) {
      // Column doesn't exist, add it
      await query(`
        ALTER TABLE users 
        ADD COLUMN last_login TIMESTAMP WITH TIME ZONE
      `);
      console.log("✅ Added last_login column to users table");
    }
    // If column already exists, silently continue (idempotent)
  } catch (error) {
    // If error is about column already existing, that's okay
    if (error.message.includes("already exists") || error.code === "42701") {
      // Column already exists, that's fine
      return;
    }
    // Re-throw other errors
    throw error;
  }
}

