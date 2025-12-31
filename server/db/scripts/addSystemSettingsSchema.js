/**
 * Migration: Add system_settings table
 */

import { query } from "../postgresConnect.js";

export default async function addSystemSettingsSchema() {
  try {
    console.log("🔧 Adding system_settings table...");

    // Check if table exists
    const checkResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'system_settings'
    `);

    if (checkResult.rows.length > 0) {
      console.log("✅ system_settings table already exists");
      // Initialize default settings if they don't exist
      await initializeDefaultSettings();
      return;
    }

    // Create system_settings table
    await query(`
      CREATE TABLE IF NOT EXISTS system_settings (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key VARCHAR(255) UNIQUE NOT NULL,
        value JSONB NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create index
    await query(`
      CREATE INDEX idx_system_settings_key ON system_settings(key);
    `);

    // Add trigger for updated_at
    await query(`
      CREATE TRIGGER update_system_settings_updated_at 
      BEFORE UPDATE ON system_settings
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log("✅ System settings table created");

    // Initialize default settings
    await initializeDefaultSettings();
  } catch (error) {
    if (error.message.includes("already exists") || error.code === "42P07") {
      console.log("⚠️ Table already exists (this is okay)");
      await initializeDefaultSettings();
      return;
    }
    console.error("❌ Error creating system_settings table:", error);
    throw error;
  }
}

async function initializeDefaultSettings() {
  try {
    // Check if require_2fa setting exists
    const checkResult = await query(`
      SELECT key FROM system_settings WHERE key = 'require_2fa'
    `);

    if (checkResult.rows.length === 0) {
      // Insert default setting (false as JSON boolean)
      await query(`
        INSERT INTO system_settings (key, value, description)
        VALUES ('require_2fa', $1::jsonb, 'Require 2FA for all users')
      `, [false]);
      console.log("✅ Initialized default system settings");
    }
  } catch (error) {
    console.error("⚠️ Error initializing default settings:", error.message);
  }
}

