/**
 * System Settings Service
 * Handles system-wide settings like 2FA enforcement
 */

import { query } from "../postgresConnect.js";

/**
 * Get a system setting by key
 */
export async function getSetting(key) {
  const result = await query(
    "SELECT key, value, description FROM system_settings WHERE key = $1",
    [key]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    key: result.rows[0].key,
    value: result.rows[0].value,
    description: result.rows[0].description,
  };
}

/**
 * Set a system setting
 */
export async function setSetting(key, value, description = null) {
  const existing = await getSetting(key);

  // Pass value directly - PostgreSQL JSONB and pg driver handle conversion automatically
  // For boolean true/false, this will be stored as JSON boolean
  if (existing) {
    // Update existing
    const result = await query(
      `UPDATE system_settings 
       SET value = $1::jsonb, description = COALESCE($2, description), updated_at = CURRENT_TIMESTAMP
       WHERE key = $3
       RETURNING key, value, description`,
      [value, description, key]
    );
    return {
      key: result.rows[0].key,
      value: result.rows[0].value,
      description: result.rows[0].description,
    };
  } else {
    // Create new
    const result = await query(
      `INSERT INTO system_settings (key, value, description)
       VALUES ($1, $2::jsonb, $3)
       RETURNING key, value, description`,
      [key, value, description]
    );
    return {
      key: result.rows[0].key,
      value: result.rows[0].value,
      description: result.rows[0].description,
    };
  }
}

/**
 * Get all system settings
 */
export async function getAllSettings() {
  const result = await query(
    "SELECT key, value, description FROM system_settings ORDER BY key"
  );

  const settings = {};
  result.rows.forEach((row) => {
    settings[row.key] = {
      value: row.value,
      description: row.description,
    };
  });

  return settings;
}

/**
 * Get boolean setting (convenience method)
 */
export async function getBooleanSetting(key, defaultValue = false) {
  const setting = await getSetting(key);
  if (!setting) return defaultValue;
  
  // Handle JSONB boolean values
  if (typeof setting.value === 'boolean') {
    return setting.value;
  }
  if (typeof setting.value === 'string') {
    return setting.value === 'true' || setting.value === '1';
  }
  return defaultValue;
}

