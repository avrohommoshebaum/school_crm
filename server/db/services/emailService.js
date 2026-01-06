/**
 * Email Service
 * Handles database operations for email messages and scheduled emails
 */

import { query } from "../postgresConnect.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Create a new email message record
 */
export async function createEmailMessage(data) {
  const {
    subject,
    htmlContent,
    textContent,
    recipientType,
    recipientGroupIds,
    toRecipients,
    ccRecipients,
    bccRecipients,
    fromName,
    replyTo,
    disableReplyTo,
    sendgridMessageId,
    status,
    sentBy,
  } = data;

  const result = await query(
    `INSERT INTO email_messages (
      id, subject, html_content, text_content, recipient_type, recipient_group_ids,
      to_recipients, cc_recipients, bcc_recipients, from_name, reply_to, disable_reply_to,
      sendgrid_message_id, status, sent_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      uuidv4(),
      subject,
      htmlContent,
      textContent || null,
      recipientType,
      recipientGroupIds || [],
      toRecipients || [],
      ccRecipients || [],
      bccRecipients || [],
      fromName || null,
      replyTo || null,
      disableReplyTo || false,
      sendgridMessageId || null,
      status || "sent",
      sentBy,
    ]
  );

  return result.rows[0];
}

/**
 * Get email messages with pagination and filtering
 */
export async function getEmailMessages(options = {}) {
  const {
    page = 1,
    limit = 50,
    sentBy = null,
    recipientType = null,
    startDate = null,
    endDate = null,
  } = options;

  const offset = (page - 1) * limit;
  let sql = `
    SELECT 
      e.*,
      u.email as sent_by_email,
      u.name as sent_by_name,
      COALESCE(array_length(e.to_recipients, 1), 0) + 
      COALESCE(array_length(e.cc_recipients, 1), 0) + 
      COALESCE(array_length(e.bcc_recipients, 1), 0) as recipient_count
    FROM email_messages e
    LEFT JOIN users u ON e.sent_by = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (sentBy) {
    sql += ` AND e.sent_by = $${paramIndex++}`;
    params.push(sentBy);
  }

  if (recipientType) {
    sql += ` AND e.recipient_type = $${paramIndex++}`;
    params.push(recipientType);
  }

  if (startDate) {
    sql += ` AND e.sent_at >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND e.sent_at <= $${paramIndex++}`;
    params.push(endDate);
  }

  sql += ` ORDER BY e.sent_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get email message by ID
 */
export async function getEmailMessageById(id) {
  const result = await query(
    `SELECT 
      e.*,
      u.email as sent_by_email,
      u.name as sent_by_name
    FROM email_messages e
    LEFT JOIN users u ON e.sent_by = u.id
    WHERE e.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Get total count of email messages
 */
export async function getEmailMessageCount(options = {}) {
  const { recipientType = null, startDate = null, endDate = null } = options;

  let sql = `SELECT COUNT(*) as count FROM email_messages WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

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
 * Create a scheduled email
 */
export async function createScheduledEmail(data) {
  const {
    subject,
    htmlContent,
    textContent,
    recipientType,
    recipientGroupIds,
    toRecipients,
    ccRecipients,
    bccRecipients,
    fromName,
    replyTo,
    disableReplyTo,
    attachments,
    scheduledFor,
    createdBy,
  } = data;

  const result = await query(
    `INSERT INTO scheduled_emails (
      id, subject, html_content, text_content, recipient_type, recipient_group_ids,
      to_recipients, cc_recipients, bcc_recipients, from_name, reply_to, disable_reply_to,
      attachments, scheduled_for, created_by, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
    RETURNING *`,
    [
      uuidv4(),
      subject,
      htmlContent,
      textContent || null,
      recipientType,
      recipientGroupIds || [],
      toRecipients || [],
      ccRecipients || [],
      bccRecipients || [],
      fromName || null,
      replyTo || null,
      disableReplyTo || false,
      attachments ? JSON.stringify(attachments) : null,
      scheduledFor,
      createdBy,
    ]
  );

  return result.rows[0];
}

/**
 * Get scheduled emails that are ready to send
 * No limit - processes all pending emails in one batch
 */
export async function getPendingScheduledEmails() {
  const result = await query(
    `SELECT * FROM scheduled_emails
     WHERE status = 'pending' AND scheduled_for <= CURRENT_TIMESTAMP
     ORDER BY scheduled_for ASC`,
    []
  );

  return result.rows;
}

/**
 * Update scheduled email status
 */
export async function updateScheduledEmailStatus(id, status, emailMessageId = null, errorMessage = null) {
  const updates = [];
  const params = [];
  let paramIndex = 1;

  updates.push(`status = $${paramIndex++}`);
  params.push(status);

  if (emailMessageId) {
    updates.push(`email_message_id = $${paramIndex++}`);
    params.push(emailMessageId);
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

  const sql = `UPDATE scheduled_emails SET ${updates.join(", ")} WHERE id = $${paramIndex}`;

  const result = await query(sql, params);
  return result.rows[0];
}

/**
 * Get scheduled emails with pagination and filtering
 */
export async function getScheduledEmails(options = {}) {
  const {
    page = 1,
    limit = 50,
    createdBy = null,
    status = null,
    startDate = null,
    endDate = null,
  } = options;

  const offset = (page - 1) * limit;
  let sql = `
    SELECT 
      s.*,
      u.email as created_by_email,
      u.name as created_by_name,
      COALESCE(array_length(s.to_recipients, 1), 0) + 
      COALESCE(array_length(s.cc_recipients, 1), 0) + 
      COALESCE(array_length(s.bcc_recipients, 1), 0) as recipient_count
    FROM scheduled_emails s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE 1=1
  `;
  const params = [];
  let paramIndex = 1;

  if (createdBy) {
    sql += ` AND s.created_by = $${paramIndex++}`;
    params.push(createdBy);
  }

  if (status) {
    sql += ` AND s.status = $${paramIndex++}`;
    params.push(status);
  }

  if (startDate) {
    sql += ` AND s.scheduled_for >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND s.scheduled_for <= $${paramIndex++}`;
    params.push(endDate);
  }

  sql += ` ORDER BY s.scheduled_for DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  params.push(limit, offset);

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get scheduled email by ID
 */
export async function getScheduledEmailById(id) {
  const result = await query(
    `SELECT 
      s.*,
      u.email as created_by_email,
      u.name as created_by_name
    FROM scheduled_emails s
    LEFT JOIN users u ON s.created_by = u.id
    WHERE s.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Cancel a pending scheduled email
 */
export async function cancelScheduledEmail(id) {
  const result = await query(
    `UPDATE scheduled_emails 
     SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
     WHERE id = $1 AND status = 'pending'
     RETURNING *`,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Get total count of scheduled emails
 */
export async function getScheduledEmailCount(options = {}) {
  const { status = null, startDate = null, endDate = null } = options;

  let sql = `SELECT COUNT(*) as count FROM scheduled_emails WHERE 1=1`;
  const params = [];
  let paramIndex = 1;

  if (status) {
    sql += ` AND status = $${paramIndex++}`;
    params.push(status);
  }

  if (startDate) {
    sql += ` AND scheduled_for >= $${paramIndex++}`;
    params.push(startDate);
  }

  if (endDate) {
    sql += ` AND scheduled_for <= $${paramIndex++}`;
    params.push(endDate);
  }

  const result = await query(sql, params);
  return parseInt(result.rows[0].count, 10);
}

// Export all functions as a service object
export const emailService = {
  createEmailMessage,
  getEmailMessages,
  getEmailMessageById,
  getEmailMessageCount,
  createScheduledEmail,
  getPendingScheduledEmails,
  updateScheduledEmailStatus,
  getScheduledEmails,
  getScheduledEmailById,
  cancelScheduledEmail,
  getScheduledEmailCount,
};

