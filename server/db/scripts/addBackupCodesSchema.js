/**
 * Migration: Add backup codes table for 2FA
 */

import { query } from "../postgresConnect.js";

export default async function addBackupCodesSchema() {
  try {
    console.log("🔧 Adding backup codes table...");

    // Check if table exists
    const checkResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'user_backup_codes'
    `);

    if (checkResult.rows.length > 0) {
      console.log("✅ backup_codes table already exists");
      return;
    }

    // Create backup codes table
    await query(`
      CREATE TABLE IF NOT EXISTS user_backup_codes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        code_hash VARCHAR(255) NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        used_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, code_hash)
      )
    `);

    // Create indexes
    await query(`
      CREATE INDEX idx_backup_codes_user_id ON user_backup_codes(user_id);
      CREATE INDEX idx_backup_codes_used ON user_backup_codes(used);
    `);

    console.log("✅ Backup codes table created");
  } catch (error) {
    if (error.message.includes("already exists") || error.code === "42P07") {
      console.log("⚠️ Table already exists (this is okay)");
      return;
    }
    console.error("❌ Error creating backup codes table:", error);
    throw error;
  }
}

