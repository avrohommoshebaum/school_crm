/**
 * Migration: Add 2FA fields to users table for SMS/Phone Call 2FA
 */

import { query } from "../postgresConnect.js";

export default async function add2FASchema() {
  try {
    console.log("🔧 Adding 2FA fields to users table...");

    // Check which columns exist
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('mfa_phone', 'mfa_method', 'mfa_code', 'mfa_code_expires')
    `);

    const existingColumns = checkResult.rows.map(r => r.column_name);

    // Add mfa_phone if it doesn't exist
    if (!existingColumns.includes('mfa_phone')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN mfa_phone VARCHAR(50)
      `);
      console.log("✅ Added mfa_phone column");
    }

    // Add mfa_method if it doesn't exist (SMS or 'phone_call')
    if (!existingColumns.includes('mfa_method')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN mfa_method VARCHAR(20) CHECK (mfa_method IN ('SMS', 'phone_call'))
      `);
      console.log("✅ Added mfa_method column");
    }

    // Add mfa_code if it doesn't exist (temporary verification code)
    if (!existingColumns.includes('mfa_code')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN mfa_code VARCHAR(10)
      `);
      console.log("✅ Added mfa_code column");
    }

    // Add mfa_code_expires if it doesn't exist
    if (!existingColumns.includes('mfa_code_expires')) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN mfa_code_expires TIMESTAMP WITH TIME ZONE
      `);
      console.log("✅ Added mfa_code_expires column");
    }

    console.log("✅ 2FA schema migration complete");
  } catch (error) {
    // If error is about column already existing, that's okay
    if (error.message.includes("already exists") || error.code === "42701") {
      console.log("⚠️ Some columns already exist (this is okay)");
      return;
    }
    console.error("❌ Error adding 2FA columns:", error);
    throw error;
  }
}

