/**
 * User Settings Service - PostgreSQL Implementation
 * 
 * This service handles all user settings-related database operations using PostgreSQL
 */

import { query } from "../postgresConnect.js";

// Helper to convert database row to settings object
const rowToSettings = (row) => {
  if (!row) return null;
  return {
    _id: row.id,
    id: row.id,
    user: row.user_id,
    userId: row.user_id,
    user_id: row.user_id, // Keep all variants for compatibility
    settings: row.settings || {}, // JSONB object
    createdAt: row.created_at,
    created_at: row.created_at, // Keep both for compatibility
    updatedAt: row.updated_at,
    updated_at: row.updated_at, // Keep both for compatibility
  };
};

export const userSettingsService = {
  async findByUserId(userId) {
    if (!userId) return null;
    const result = await query("SELECT * FROM user_settings WHERE user_id = $1 LIMIT 1", [userId]);
    return result.rows.length > 0 ? rowToSettings(result.rows[0]) : null;
  },

  async upsert(userId, settingsData) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const existing = await this.findByUserId(userId);
    const now = new Date();

    // Merge with existing settings if they exist
    const existingSettings = existing?.settings || {};
    const mergedSettings = {
      ...existingSettings,
      ...settingsData,
    };

    if (existing) {
      // Update existing
      const result = await query(
        `UPDATE user_settings 
         SET settings = $1, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $2
         RETURNING *`,
        [JSON.stringify(mergedSettings), userId]
      );
      return rowToSettings(result.rows[0]);
    } else {
      // Create new
      const result = await query(
        `INSERT INTO user_settings (user_id, settings, created_at, updated_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, JSON.stringify(mergedSettings), now, now]
      );
      return rowToSettings(result.rows[0]);
    }
  },

  async update(userId, updates) {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const existing = await this.findByUserId(userId);

    if (!existing) {
      return this.upsert(userId, updates);
    }

    // Merge with existing settings
    const existingSettings = existing.settings || {};
    const mergedSettings = {
      ...existingSettings,
      ...updates,
    };

    const result = await query(
      `UPDATE user_settings 
       SET settings = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2
       RETURNING *`,
      [JSON.stringify(mergedSettings), userId]
    );

    return rowToSettings(result.rows[0]);
  },
};
