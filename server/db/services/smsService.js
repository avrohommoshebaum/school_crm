/**
 * SMS Service
 * Handles database operations for SMS messages and scheduled SMS
 */

import { query } from "../postgresConnect.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new SMS message record
 */
export async function createSMSMessage(data) {
  const {
    message,
    recipientType,
    recipientGroupId,
    recipientMemberId,
    recipientPhoneNumbers,
    twilioMessageSid,
    twilioStatus,
    segments,
    sentBy,
  } = data;

  const result = await query(
    `INSERT INTO sms_messages (
      id, message, recipient_type, recipient_group_id, recipient_member_id,
      recipient_phone_numbers, twilio_message_sid, twilio_status, segments, sent_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      uuidv4(),
      message,
      recipientType,
      recipientGroupId || null,
      recipientMemberId || null,
      recipientPhoneNumbers,
      twilioMessageSid || null,
      twilioStatus || "queued",
      segments || 1,
      sentBy,
    ]
  );

  return result.rows[0];
}

/**
 * Create multiple SMS message records (for bulk sends)
 */
export async function createBulkSMSMessages(messages) {
  if (messages.length === 0) return [];

  const values = [];
  const placeholders = [];
  let paramIndex = 1;

  for (const msg of messages) {
    const id = uuidv4();
    placeholders.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    values.push(
      id,
      msg.message,
      msg.recipientType,
      msg.recipientGroupId || null,
      msg.recipientMemberId || null,
      msg.recipientPhoneNumbers,
      msg.twilioMessageSid || null,
      msg.twilioStatus || "queued",
      msg.segments || 1,
      msg.sentBy
    );
  }

  const result = await query(
    `INSERT INTO sms_messages (
      id, message, recipient_type, recipient_group_id, recipient_member_id,
      recipient_phone_numbers, twilio_message_sid, twilio_status, segments, sent_by
    ) VALUES ${placeholders.join(", ")}
    RETURNING *`,
    values
  );

  return result.rows;
}

/**
 * Update SMS message status
 */
export async function updateSMSMessageStatus(id, twilioStatus, twilioMessageSid = null) {
  const result = await query(
    `UPDATE sms_messages
     SET twilio_status = $1, twilio_message_sid = COALESCE($2, twilio_message_sid), updated_at = CURRENT_TIMESTAMP
     WHERE id = $3
     RETURNING *`,
    [twilioStatus, twilioMessageSid, id]
  );

  return result.rows[0];
}

/**
 * Get SMS messages with pagination
 */
export async function getSMSMessages(options = {}) {
  const {
    limit = 50,
    offset = 0,
    sentBy = null,
    recipientType = null,
    startDate = null,
    endDate = null,
  } = options;

  let sql = `
    SELECT 
      sm.*,
      u.name as sent_by_name,
      u.email as sent_by_email,
      cg.name as group_name,
      gm.first_name as member_first_name,
      gm.last_name as member_last_name
    FROM sms_messages sm
    LEFT JOIN users u ON sm.sent_by = u.id
    LEFT JOIN communication_groups cg ON sm.recipient_group_id = cg.id
    LEFT JOIN group_members gm ON sm.recipient_member_id = gm.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (sentBy) {
    sql += ` AND sm.sent_by = $${paramIndex++}`;
    params.push(sentBy);
  }

  if (recipientType) {
    sql += ` AND sm.recipient_type = $${paramIndex++}`;
    params.push(recipientType);
  }

  if (startDate) {
    sql += ` AND sm.sent_at >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND sm.sent_at <= $${paramIndex++}`;
    params.push(endDate);
  }

  sql += ` ORDER BY sm.sent_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get SMS message by ID
 */
export async function getSMSMessageById(id) {
  const result = await query(
    `SELECT 
      sm.*,
      u.name as sent_by_name,
      u.email as sent_by_email,
      cg.name as group_name,
      gm.first_name as member_first_name,
      gm.last_name as member_last_name
    FROM sms_messages sm
    LEFT JOIN users u ON sm.sent_by = u.id
    LEFT JOIN communication_groups cg ON sm.recipient_group_id = cg.id
    LEFT JOIN group_members gm ON sm.recipient_member_id = gm.id
    WHERE sm.id = $1`,
    [id]
  );

  return result.rows[0];
}

/**
 * Get count of SMS messages
 */
export async function getSMSMessageCount(options = {}) {
  const { sentBy = null, recipientType = null, startDate = null, endDate = null } = options;

  let sql = `SELECT COUNT(*) as count FROM sms_messages WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  if (sentBy) {
    sql += ` AND sent_by = $${paramIndex++}`;
    params.push(sentBy);
  }

  if (recipientType) {
    sql += ` AND recipient_type = $${paramIndex++}`;
    params.push(recipientType);
  }

  if (startDate) {
    sql += ` AND sent_at >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND sent_at <= $${paramIndex++}`;
    params.push(endDate);
  }

  const result = await query(sql, params);
  return parseInt(result.rows[0].count, 10);
}

/**
 * Create a scheduled SMS
 */
export async function createScheduledSMS(data) {
  const {
    message,
    recipientType,
    recipientGroupId,
    recipientMemberId,
    recipientPhoneNumbers,
    scheduledFor,
    createdBy,
  } = data;

  const result = await query(
    `INSERT INTO scheduled_sms (
      id, message, recipient_type, recipient_group_id, recipient_member_id,
      recipient_phone_numbers, scheduled_for, created_by, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
    RETURNING *`,
    [
      uuidv4(),
      message,
      recipientType,
      recipientGroupId || null,
      recipientMemberId || null,
      recipientPhoneNumbers,
      scheduledFor,
      createdBy,
    ]
  );

  return result.rows[0];
}

/**
 * Get scheduled SMS that are ready to send
 * No limit - processes all pending SMS in one batch
 */
export async function getPendingScheduledSMS() {
  const result = await query(
    `SELECT * FROM scheduled_sms
     WHERE status = 'pending' AND scheduled_for <= CURRENT_TIMESTAMP
     ORDER BY scheduled_for ASC`,
    []
  );

  return result.rows;
}

/**
 * Update scheduled SMS status
 */
export async function updateScheduledSMSStatus(id, status, smsMessageId = null, errorMessage = null) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  updates.push(`status = $${paramIndex++}`);
  params.push(status);

  if (smsMessageId) {
    updates.push(`sms_message_id = $${paramIndex++}`);
    params.push(smsMessageId);
  }

  if (errorMessage) {
    updates.push(`error_message = $${paramIndex++}`);
    params.push(errorMessage);
  }

  if (status === "sent") {
    updates.push(`sent_at = CURRENT_TIMESTAMP`);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  params.push(id);

  const sql = `UPDATE scheduled_sms SET ${updates.join(", ")} WHERE id = $${paramIndex}`;

  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get scheduled SMS with pagination
 */
export async function getScheduledSMS(options = {}) {
  const {
    limit = 50,
    offset = 0,
    createdBy = null,
    status = null,
    startDate = null,
    endDate = null,
  } = options;

  let sql = `
    SELECT 
      ss.*,
      u.name as created_by_name,
      u.email as created_by_email,
      cg.name as group_name,
      gm.first_name as member_first_name,
      gm.last_name as member_last_name
    FROM scheduled_sms ss
    LEFT JOIN users u ON ss.created_by = u.id
    LEFT JOIN communication_groups cg ON ss.recipient_group_id = cg.id
    LEFT JOIN group_members gm ON ss.recipient_member_id = gm.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (createdBy) {
    sql += ` AND ss.created_by = $${paramIndex++}`;
    params.push(createdBy);
  }

  if (status) {
    sql += ` AND ss.status = $${paramIndex++}`;
    params.push(status);
  }

  if (startDate) {
    sql += ` AND ss.scheduled_for >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND ss.scheduled_for <= $${paramIndex++}`;
    params.push(endDate);
  }

  sql += ` ORDER BY ss.scheduled_for DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Cancel a scheduled SMS
 */
export async function cancelScheduledSMS(id) {
  const result = await query(
    `UPDATE scheduled_sms
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [id]
  );

  return result.rows[0];
}

/**
 * Get scheduled SMS by ID
 */
export async function getScheduledSMSById(id) {
  const result = await query(
    `SELECT 
      ss.*,
      u.name as created_by_name,
      u.email as created_by_email,
      cg.name as group_name,
      gm.first_name as member_first_name,
      gm.last_name as member_last_name
    FROM scheduled_sms ss
    LEFT JOIN users u ON ss.created_by = u.id
    LEFT JOIN communication_groups cg ON ss.recipient_group_id = cg.id
    LEFT JOIN group_members gm ON ss.recipient_member_id = gm.id
    WHERE ss.id = $1`,
    [id]
  );

  return result.rows[0];
}

/**
 * Create SMS recipient log entry
 */
export async function createSMSRecipientLog(data) {
  const {
    smsMessageId,
    phoneNumber,
    twilioSid,
    status,
    errorCode,
    errorMessage,
  } = data;

  const result = await query(
    `INSERT INTO sms_recipient_logs (
      id, sms_message_id, phone_number, twilio_sid, status, error_code, error_message
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      uuidv4(),
      smsMessageId,
      phoneNumber,
      twilioSid || null,
      status || "queued",
      errorCode || null,
      errorMessage || null,
    ]
  );

  return result.rows[0];
}

/**
 * Create multiple SMS recipient log entries (for bulk sends)
 */
export async function createBulkSMSRecipientLogs(logs) {
  if (logs.length === 0) return [];

  const values = [];
  const placeholders = [];
  let paramIndex = 1;

  for (const log of logs) {
    const id = uuidv4();
    placeholders.push(
      `($${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++}, $${paramIndex++})`
    );
    values.push(
      id,
      log.smsMessageId,
      log.phoneNumber,
      log.twilioSid || null,
      log.status || "queued",
      log.errorCode || null,
      log.errorMessage || null
    );
  }

  const result = await query(
    `INSERT INTO sms_recipient_logs (
      id, sms_message_id, phone_number, twilio_sid, status, error_code, error_message
    ) VALUES ${placeholders.join(", ")}
    RETURNING *`,
    values
  );

  return result.rows;
}

/**
 * Get SMS recipient logs by message ID
 */
export async function getSMSRecipientLogs(smsMessageId) {
  const result = await query(
    `SELECT * FROM sms_recipient_logs
     WHERE sms_message_id = $1
     ORDER BY created_at ASC`,
    [smsMessageId]
  );

  return result.rows;
}

/**
 * Update SMS recipient log status
 */
export async function updateSMSRecipientLog(id, updates) {
  const setClauses = [];
  const values = [];
  let paramIndex = 1;

  for (const key in updates) {
    setClauses.push(`${key} = $${paramIndex++}`);
    values.push(updates[key]);
  }

  if (setClauses.length === 0) {
    return null;
  }

  setClauses.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const result = await query(
    `UPDATE sms_recipient_logs
     SET ${setClauses.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING *`,
    values
  );

  return result.rows[0];
}

// Export all functions as a service object (for consistency with other services)
export const smsService = {
  createSMSMessage,
  createBulkSMSMessages,
  updateSMSMessageStatus,
  getSMSMessages,
  getSMSMessageById,
  getSMSMessageCount,
  createScheduledSMS,
  getPendingScheduledSMS,
  updateScheduledSMSStatus,
  getScheduledSMS,
  cancelScheduledSMS,
  getScheduledSMSById,
  createSMSRecipientLog,
  createBulkSMSRecipientLogs,
  getSMSRecipientLogs,
  updateSMSRecipientLog,
};

