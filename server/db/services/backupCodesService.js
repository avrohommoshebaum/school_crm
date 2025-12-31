/**
 * Backup Codes Service
 * Handles generation, storage, and verification of 2FA backup codes
 */

import { query } from "../postgresConnect.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";

/**
 * Generate 10 backup codes (8-digit each)
 */
export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    // Generate 8-digit code
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
  }
  return codes;
}

/**
 * Hash a backup code for storage
 */
async function hashCode(code) {
  return await bcrypt.hash(code, 10);
}

/**
 * Generate and store backup codes for a user
 * Returns the plain codes (only shown once)
 */
export async function createBackupCodes(userId) {
  // Delete existing unused codes
  await query(
    "DELETE FROM user_backup_codes WHERE user_id = $1 AND used = FALSE",
    [userId]
  );

  // Generate new codes
  const codes = generateBackupCodes();
  const hashedCodes = await Promise.all(codes.map(code => hashCode(code)));

  // Insert hashed codes
  for (const hashedCode of hashedCodes) {
    await query(
      "INSERT INTO user_backup_codes (user_id, code_hash) VALUES ($1, $2)",
      [userId, hashedCode]
    );
  }

  // Return plain codes (only time they're shown)
  return codes;
}

/**
 * Verify a backup code
 * Returns true if valid and unused, marks it as used
 */
export async function verifyBackupCode(userId, code) {
  // Get all unused codes for this user
  const result = await query(
    "SELECT id, code_hash FROM user_backup_codes WHERE user_id = $1 AND used = FALSE",
    [userId]
  );

  // Check each code
  for (const row of result.rows) {
    const isValid = await bcrypt.compare(code, row.code_hash);
    if (isValid) {
      // Mark as used
      await query(
        "UPDATE user_backup_codes SET used = TRUE, used_at = CURRENT_TIMESTAMP WHERE id = $1",
        [row.id]
      );
      return true;
    }
  }

  return false;
}

/**
 * Get count of unused backup codes for a user
 */
export async function getUnusedBackupCodesCount(userId) {
  const result = await query(
    "SELECT COUNT(*) as count FROM user_backup_codes WHERE user_id = $1 AND used = FALSE",
    [userId]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get all backup codes for a user (admin view - shows which are used)
 */
export async function getBackupCodesStatus(userId) {
  const result = await query(
    "SELECT id, used, created_at, used_at FROM user_backup_codes WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  );
  return result.rows;
}

