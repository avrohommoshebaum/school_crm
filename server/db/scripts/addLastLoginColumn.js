/**
 * Migration: Add last_login column to users table
 * Run this once to add the last_login column if it doesn't exist
 */

import { query } from "../postgresConnect.js";

async function addLastLoginColumn() {
  try {
    console.log("🔧 Adding last_login column to users table...");

    // Check if column already exists
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='users' AND column_name='last_login'
    `);

    if (checkResult.rows.length > 0) {
      console.log("✅ last_login column already exists");
      return;
    }

    // Add the column
    await query(`
      ALTER TABLE users 
      ADD COLUMN last_login TIMESTAMP WITH TIME ZONE
    `);

    console.log("✅ Successfully added last_login column to users table");
  } catch (error) {
    console.error("❌ Error adding last_login column:", error);
    throw error;
  }
}

// Run if called directly
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` ||
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('addLastLoginColumn.js')) {
  addLastLoginColumn()
    .then(() => {
      console.log("✅ Migration complete!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Migration failed:", error);
      process.exit(1);
    });
}

export default addLastLoginColumn;

