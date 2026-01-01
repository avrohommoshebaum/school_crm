/**
 * Robocall Service
 * Handles database operations for robocall messages, scheduled robocalls, and recordings
 */

import { query } from "../postgresConnect.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new robocall message record
 */
export async function createRobocallMessage(data) {
  const {
    recordingMethod,
    textContent,
    audioGcsPath,
    audioUrl,
    recipientType,
    recipientGroupIds,
    recipientPhoneNumbers,
    twilioStatus,
    totalRecipients,
    successCount,
    failCount,
    sentBy,
  } = data;

  const result = await query(
    `INSERT INTO robocall_messages (
      id, recording_method, text_content, audio_gcs_path, audio_url,
      recipient_type, recipient_group_ids, recipient_phone_numbers,
      twilio_status, total_recipients, success_count, fail_count, sent_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      uuidv4(),
      recordingMethod,
      textContent || null,
      audioGcsPath || null,
      audioUrl || null,
      recipientType,
      recipientGroupIds || [],
      recipientPhoneNumbers || [],
      twilioStatus || "queued",
      totalRecipients || 0,
      successCount || 0,
      failCount || 0,
      sentBy,
    ]
  );

  return result.rows[0];
}

/**
 * Update robocall message status
 */
export async function updateRobocallMessageStatus(
  id,
  twilioStatus,
  successCount = null,
  failCount = null
) {
  const updates = ["twilio_status = $1", "updated_at = CURRENT_TIMESTAMP"];
  const values = [twilioStatus, id];
  let paramIndex = 2;

  if (successCount !== null) {
    paramIndex++;
    updates.push(`success_count = $${paramIndex}`);
    values.splice(values.length - 1, 0, successCount);
  }

  if (failCount !== null) {
    paramIndex++;
    updates.push(`fail_count = $${paramIndex}`);
    values.splice(values.length - 1, 0, failCount);
  }

  const result = await query(
    `UPDATE robocall_messages
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex + 1}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

/**
 * Create recipient log entry
 */
export async function createRobocallRecipientLog(data) {
  const {
    robocallMessageId,
    phoneNumber,
    twilioCallSid,
    twilioStatus,
    duration,
    errorCode,
    errorMessage,
  } = data;

  const result = await query(
    `INSERT INTO robocall_recipient_logs (
      id, robocall_message_id, phone_number, twilio_call_sid,
      twilio_status, duration, error_code, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      uuidv4(),
      robocallMessageId,
      phoneNumber,
      twilioCallSid || null,
      twilioStatus || "queued",
      duration || null,
      errorCode || null,
      errorMessage || null,
    ]
  );

  return result.rows[0];
}

/**
 * Create bulk recipient logs
 */
export async function createBulkRobocallRecipientLogs(logs) {
  if (logs.length === 0) return [];

  const values = [];
  const placeholders = [];
  let paramIndex = 1;

  for (const log of logs) {
    const id = uuidv4();
    placeholders.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    values.push(
      id,
      log.robocallMessageId,
      log.phoneNumber,
      log.twilioCallSid || null,
      log.twilioStatus || "queued",
      log.duration || null,
      log.errorCode || null,
      log.errorMessage || null
    );
  }

  const result = await query(
    `INSERT INTO robocall_recipient_logs (
      id, robocall_message_id, phone_number, twilio_call_sid,
      twilio_status, duration, error_code, error_message
    ) VALUES ${placeholders.join(", ")}
    RETURNING *`,
    values
  );

  return result.rows;
}

/**
 * Create scheduled robocall
 */
export async function createScheduledRobocall(data) {
  const {
    recordingMethod,
    textContent,
    audioGcsPath,
    recipientType,
    recipientGroupIds,
    recipientPhoneNumbers,
    scheduledFor,
    createdBy,
  } = data;

  const result = await query(
    `INSERT INTO scheduled_robocalls (
      id, recording_method, text_content, audio_gcs_path,
      recipient_type, recipient_group_ids, recipient_phone_numbers,
      scheduled_for, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      uuidv4(),
      recordingMethod,
      textContent || null,
      audioGcsPath || null,
      recipientType,
      recipientGroupIds || [],
      recipientPhoneNumbers || [],
      scheduledFor,
      createdBy,
    ]
  );

  return result.rows[0];
}

/**
 * Get pending scheduled robocalls
 */
export async function getPendingScheduledRobocalls() {
  const result = await query(
    `SELECT * FROM scheduled_robocalls
     WHERE status = 'pending'
       AND scheduled_for <= CURRENT_TIMESTAMP
     ORDER BY scheduled_for ASC`
  );

  return result.rows;
}

/**
 * Update scheduled robocall status
 */
export async function updateScheduledRobocallStatus(
  id,
  status,
  robocallMessageId = null,
  errorMessage = null
) {
  const updates = ["status = $1", "updated_at = CURRENT_TIMESTAMP"];
  const values = [status, id];
  let paramIndex = 2;

  if (robocallMessageId) {
    paramIndex++;
    updates.push(`robocall_message_id = $${paramIndex}`);
    values.splice(values.length - 1, 0, robocallMessageId);
  }

  if (errorMessage) {
    paramIndex++;
    updates.push(`error_message = $${paramIndex}`);
    values.splice(values.length - 1, 0, errorMessage);
  }

  if (status === "sent") {
    updates.push("sent_at = CURRENT_TIMESTAMP");
  }

  const result = await query(
    `UPDATE scheduled_robocalls
     SET ${updates.join(", ")}
     WHERE id = $${paramIndex + 1}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

/**
 * Get scheduled robocall by ID
 */
export async function getScheduledRobocallById(id) {
  const result = await query(
    `SELECT * FROM scheduled_robocalls WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

/**
 * Create saved audio recording
 */
export async function createSavedAudioRecording(data) {
  const {
    name,
    description,
    audioGcsPath,
    durationSeconds,
    fileSizeBytes,
    recordingMethod,
    createdBy,
  } = data;

  const result = await query(
    `INSERT INTO saved_audio_recordings (
      id, name, description, audio_gcs_path, duration_seconds,
      file_size_bytes, recording_method, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *`,
    [
      uuidv4(),
      name,
      description || null,
      audioGcsPath,
      durationSeconds || null,
      fileSizeBytes || null,
      recordingMethod,
      createdBy,
    ]
  );

  return result.rows[0];
}

/**
 * Get saved audio recordings for a user
 */
export async function getSavedAudioRecordings(userId, limit = 50) {
  const result = await query(
    `SELECT * FROM saved_audio_recordings
     WHERE created_by = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [userId, limit]
  );

  return result.rows;
}

/**
 * Create call-to-record session
 */
export async function createCallToRecordSession(data) {
  const { userId, phoneNumber, expiresAt } = data;

  const result = await query(
    `INSERT INTO call_to_record_sessions (
      id, user_id, phone_number, expires_at
    ) VALUES ($1, $2, $3, $4)
    RETURNING *`,
    [uuidv4(), userId, phoneNumber, expiresAt]
  );

  return result.rows[0];
}

/**
 * Get call-to-record session by ID
 */
export async function getCallToRecordSessionById(id) {
  const result = await query(
    `SELECT * FROM call_to_record_sessions WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}

/**
 * Update call-to-record session
 */
export async function updateCallToRecordSession(id, updates) {
  const updateClauses = ["updated_at = CURRENT_TIMESTAMP"];
  const values = [];
  let paramIndex = 1;

  if (updates.twilioCallSid !== undefined) {
    updateClauses.push(`twilio_call_sid = $${paramIndex++}`);
    values.push(updates.twilioCallSid);
  }

  if (updates.recordingSid !== undefined) {
    updateClauses.push(`recording_sid = $${paramIndex++}`);
    values.push(updates.recordingSid);
  }

  if (updates.recordingUrl !== undefined) {
    updateClauses.push(`recording_url = $${paramIndex++}`);
    values.push(updates.recordingUrl);
  }

  if (updates.recordingGcsPath !== undefined) {
    updateClauses.push(`recording_gcs_path = $${paramIndex++}`);
    values.push(updates.recordingGcsPath);
  }

  if (updates.status !== undefined) {
    updateClauses.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }

  if (updateClauses.length === 1) {
    // Only updated_at, no other updates
    return await getCallToRecordSessionById(id);
  }

  values.push(id);

  const result = await query(
    `UPDATE call_to_record_sessions
     SET ${updateClauses.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

/**
 * Get robocall messages with pagination
 */
export async function getRobocallMessages(options = {}) {
  const {
    page = 1,
    limit = 50,
    recipientType = null,
    startDate = null,
    endDate = null,
  } = options;

  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];
  let paramIndex = 1;

  if (recipientType) {
    conditions.push(`recipient_type = $${paramIndex++}`);
    values.push(recipientType);
  }

  if (startDate) {
    conditions.push(`sent_at >= $${paramIndex++}`);
    values.push(startDate);
  }

  if (endDate) {
    conditions.push(`sent_at <= $${paramIndex++}`);
    values.push(endDate);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await query(
    `SELECT * FROM robocall_messages
     ${whereClause}
     ORDER BY sent_at DESC NULLS LAST, created_at DESC
     LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...values, limit, offset]
  );

  return result.rows;
}

/**
 * Create a Twilio webhook token
 */
export async function createTwilioWebhookToken(token, callSid = null, sessionId = null, expiresAt) {
  await query(
    `INSERT INTO twilio_webhook_tokens (token, call_sid, session_id, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [token, callSid, sessionId, expiresAt]
  );
}

/**
 * Validate and get a Twilio webhook token
 * Returns token data if valid, null if invalid or expired
 */
export async function validateTwilioWebhookToken(token) {
  const result = await query(
    `SELECT * FROM twilio_webhook_tokens
     WHERE token = $1 AND expires_at > NOW()`,
    [token]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Update token with call SID
 */
export async function updateTwilioWebhookTokenCallSid(token, callSid) {
  await query(
    `UPDATE twilio_webhook_tokens
     SET call_sid = $1
     WHERE token = $2`,
    [callSid, token]
  );
}

/**
 * Delete expired tokens (cleanup job)
 */
export async function deleteExpiredTwilioWebhookTokens() {
  const result = await query(
    `DELETE FROM twilio_webhook_tokens
     WHERE expires_at <= NOW()
     RETURNING token`
  );
  return result.rows.length;
}

/**
 * Delete a specific token (after use or on error)
 */
export async function deleteTwilioWebhookToken(token) {
  await query(
    `DELETE FROM twilio_webhook_tokens WHERE token = $1`,
    [token]
  );
}

// Export all functions as a service object (for consistency with other services)
export const robocallService = {
  createRobocallMessage,
  updateRobocallMessageStatus,
  createRobocallRecipientLog,
  createBulkRobocallRecipientLogs,
  createScheduledRobocall,
  getPendingScheduledRobocalls,
  updateScheduledRobocallStatus,
  getScheduledRobocallById,
  createSavedAudioRecording,
  getSavedAudioRecordings,
  createCallToRecordSession,
  getCallToRecordSessionById,
  updateCallToRecordSession,
  getRobocallMessages,
  createTwilioWebhookToken,
  validateTwilioWebhookToken,
  updateTwilioWebhookTokenCallSid,
  deleteExpiredTwilioWebhookTokens,
  deleteTwilioWebhookToken,
};

