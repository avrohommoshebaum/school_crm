/**
 * SMS Controller
 * Handles SMS sending, scheduling, and history
 */

import { groupMemberService } from "../db/services/groupMemberService.js";
import { groupService } from "../db/services/groupService.js";
import { smsService } from "../db/services/smsService.js";
import { sendSMS, sendBulkSMS, calculateSMSSegments } from "../utils/twilio.js";
import { normalizePhone } from "../utils/validation.js";

/**
 * Send SMS to a group
 */
export const sendSMSToGroup = async (req, res) => {
  try {
    const { groupId, message } = req.body;
    const userId = req.user._id || req.user.id;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get group
    const group = await groupService.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Get all members of the group
    const members = await groupMemberService.findByGroupId(groupId);

    // Collect all unique phone numbers from members
    const phoneNumbers = new Set();
    for (const member of members) {
      const phones = member.phones || (member.phone ? [member.phone] : []);
      for (const phone of phones) {
        if (phone && phone.trim()) {
          // Normalize phone number (ensure E.164 format or at least digits only)
          const normalized = normalizePhone(phone);
          if (normalized && normalized.length >= 10) {
            // Add +1 prefix if it's a 10-digit US number
            const formatted = normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
            phoneNumbers.add(formatted);
          }
        }
      }
    }

    if (phoneNumbers.size === 0) {
      return res.status(400).json({ message: "No valid phone numbers found in this group" });
    }

    const phoneArray = Array.from(phoneNumbers);
    const segments = calculateSMSSegments(message);

    // Send SMS via Twilio
    let results = [];
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    try {
      results = await sendBulkSMS(phoneArray, message);
      successCount = results.filter((r) => r.success).length;
      failCount = results.filter((r) => !r.success).length;
      
      // Collect detailed error information
      results.forEach((r) => {
        if (!r.success) {
          errors.push({
            phoneNumber: r.phoneNumber,
            error: r.error,
            errorCode: r.errorCode,
            twilioError: r.twilioError,
          });
        }
      });
    } catch (error) {
      console.error("Error sending bulk SMS:", error);
      return res.status(500).json({ 
        message: "Failed to send SMS", 
        error: error.message,
        errorCode: error.code,
        twilioError: error.twilioError,
      });
    }

    // Create SMS message record in database
    const smsRecord = await smsService.createSMSMessage({
      message: message.trim(),
      recipientType: "group",
      recipientGroupId: groupId,
      recipientPhoneNumbers: phoneArray,
      twilioStatus: successCount > 0 ? "sent" : "failed",
      segments,
      sentBy: userId,
    });

    // Create recipient log entries for each phone number
    const recipientLogs = results.map((r) => ({
      smsMessageId: smsRecord.id,
      phoneNumber: r.phoneNumber,
      twilioSid: r.sid || null,
      status: r.success ? (r.status || "sent") : "failed",
      errorCode: r.errorCode || null,
      errorMessage: r.error || null,
    }));

    if (recipientLogs.length > 0) {
      try {
        await smsService.createBulkSMSRecipientLogs(recipientLogs);
      } catch (logError) {
        console.error(`[sendSMSToGroup] Error creating recipient logs:`, logError);
        // Don't fail the entire request if log creation fails, but log it
      }
    }

    // Determine overall status message
    let overallMessage = "SMS sent";
    if (failCount === phoneArray.length) {
      overallMessage = "Failed to send SMS to all recipients";
    } else if (failCount > 0) {
      overallMessage = `SMS sent to ${successCount} recipient(s), ${failCount} failed`;
    }

    res.json({
      message: overallMessage,
      smsId: smsRecord.id,
      totalRecipients: phoneArray.length,
      successCount,
      failCount,
      errors: errors.length > 0 ? errors : undefined,
      results: results.map((r) => ({
        phoneNumber: r.phoneNumber,
        success: r.success,
        status: r.status || r.error,
        sid: r.sid || null,
        errorCode: r.errorCode || null,
      })),
    });
  } catch (error) {
    console.error("Error sending SMS to group:", error);
    res.status(500).json({ message: "Error sending SMS", error: error.message });
  }
};

/**
 * Send SMS to an individual member
 */
export const sendSMSToMember = async (req, res) => {
  try {
    const { memberId, message, phoneNumbers } = req.body;
    const userId = req.user._id || req.user.id;

    if (!memberId) {
      return res.status(400).json({ message: "memberId is required" });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    // Get member
    const member = await groupMemberService.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Determine which phone numbers to use
    let phoneArray = [];
    if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
      // Use provided phone numbers
      phoneArray = phoneNumbers.map((p) => {
        const normalized = normalizePhone(p);
        return normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
      });
    } else {
      // Use member's phone numbers
      const phones = member.phones || (member.phone ? [member.phone] : []);
      for (const phone of phones) {
        if (phone && phone.trim()) {
          const normalized = normalizePhone(phone);
          if (normalized && normalized.length >= 10) {
            const formatted = normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
            phoneArray.push(formatted);
          }
        }
      }
    }

    if (phoneArray.length === 0) {
      return res.status(400).json({ message: "No valid phone numbers provided" });
    }

    const segments = calculateSMSSegments(message);

    // Send SMS via Twilio
    let results = [];
    let successCount = 0;
    let failCount = 0;

    try {
      results = await sendBulkSMS(phoneArray, message);
      successCount = results.filter((r) => r.success).length;
      failCount = results.filter((r) => !r.success).length;
    } catch (error) {
      console.error("Error sending SMS to member:", error);
      return res.status(500).json({ message: "Failed to send SMS", error: error.message });
    }

    // Create SMS message record
    const smsRecord = await smsService.createSMSMessage({
      message: message.trim(),
      recipientType: "individual",
      recipientMemberId: memberId,
      recipientPhoneNumbers: phoneArray,
      twilioStatus: successCount > 0 ? "sent" : "failed",
      segments,
      sentBy: userId,
    });

    // Create recipient log entries for each phone number
    const recipientLogs = results.map((r) => ({
      smsMessageId: smsRecord.id,
      phoneNumber: r.phoneNumber,
      twilioSid: r.sid || null,
      status: r.success ? (r.status || "sent") : "failed",
      errorCode: r.errorCode || null,
      errorMessage: r.error || null,
    }));

    if (recipientLogs.length > 0) {
      try {
        await smsService.createBulkSMSRecipientLogs(recipientLogs);
      } catch (logError) {
        console.error(`[sendSMSToManual] Error creating recipient logs:`, logError);
        // Don't fail the entire request if log creation fails, but log it
      }
    }

    res.json({
      message: "SMS sent",
      smsId: smsRecord.id,
      totalRecipients: phoneArray.length,
      successCount,
      failCount,
      results: results.map((r) => ({
        phoneNumber: r.phoneNumber,
        success: r.success,
        status: r.status || r.error,
        sid: r.sid || null,
      })),
    });
  } catch (error) {
    console.error("Error sending SMS to member:", error);
    res.status(500).json({ message: "Error sending SMS", error: error.message });
  }
};

/**
 * Schedule SMS for later
 */
export const scheduleSMS = async (req, res) => {
  try {
    const { groupId, memberId, message, scheduledFor, phoneNumbers } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (!scheduledFor) {
      return res.status(400).json({ message: "scheduledFor (date/time) is required" });
    }

    const scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: "Invalid scheduledFor date/time" });
    }

    if (scheduledDate < new Date()) {
      return res.status(400).json({ message: "Scheduled time must be in the future" });
    }

    let recipientType;
    let recipientGroupId = null;
    let recipientMemberId = null;
    let phoneArray = [];

    if (groupId) {
      // Schedule for group
      const group = await groupService.findById(groupId);
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }

      const members = await groupMemberService.findByGroupId(groupId);
      const phoneSet = new Set();
      for (const member of members) {
        const phones = member.phones || (member.phone ? [member.phone] : []);
        for (const phone of phones) {
          if (phone && phone.trim()) {
            const normalized = normalizePhone(phone);
            if (normalized && normalized.length >= 10) {
              const formatted = normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
              phoneSet.add(formatted);
            }
          }
        }
      }

      if (phoneSet.size === 0) {
        return res.status(400).json({ message: "No valid phone numbers found in this group" });
      }

      recipientType = "group";
      recipientGroupId = groupId;
      phoneArray = Array.from(phoneSet);
    } else if (memberId) {
      // Schedule for individual member
      const member = await groupMemberService.findById(memberId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }

      if (phoneNumbers && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
        phoneArray = phoneNumbers.map((p) => {
          const normalized = normalizePhone(p);
          return normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
        });
      } else {
        const phones = member.phones || (member.phone ? [member.phone] : []);
        for (const phone of phones) {
          if (phone && phone.trim()) {
            const normalized = normalizePhone(phone);
            if (normalized && normalized.length >= 10) {
              const formatted = normalized.length === 10 ? `+1${normalized}` : normalized.startsWith("+") ? normalized : `+${normalized}`;
              phoneArray.push(formatted);
            }
          }
        }
      }

      if (phoneArray.length === 0) {
        return res.status(400).json({ message: "No valid phone numbers provided" });
      }

      recipientType = "individual";
      recipientMemberId = memberId;
    } else {
      return res.status(400).json({ message: "Either groupId or memberId is required" });
    }

    // Create scheduled SMS record
    const scheduledSMS = await smsService.createScheduledSMS({
      message: message.trim(),
      recipientType,
      recipientGroupId,
      recipientMemberId,
      recipientPhoneNumbers: phoneArray,
      scheduledFor: scheduledDate.toISOString(),
      createdBy: userId,
    });

    res.json({
      message: "SMS scheduled successfully",
      scheduledSMSId: scheduledSMS.id,
      scheduledFor: scheduledSMS.scheduled_for,
      recipientCount: phoneArray.length,
    });
  } catch (error) {
    console.error("Error scheduling SMS:", error);
    res.status(500).json({ message: "Error scheduling SMS", error: error.message });
  }
};

/**
 * Process scheduled SMS and Emails (called by Cloud Scheduler)
 * This endpoint is protected by a secret token in headers
 */
export const processScheduledSMS = async (req, res) => {
  try {
    // Security: Check for secret token in headers
    const schedulerToken = req.headers["x-scheduler-token"];
    const expectedToken = process.env.SCHEDULER_SECRET_TOKEN;

    if (!expectedToken) {
      console.warn("⚠️ SCHEDULER_SECRET_TOKEN not set. Endpoint is unprotected.");
    } else if (schedulerToken !== expectedToken) {
      console.warn("⚠️ Unauthorized attempt to access process-scheduled endpoint");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get ALL pending SMS and Emails that are ready to send (no limit - processes everything)
    const pendingSMS = await smsService.getPendingScheduledSMS();
    const { emailService } = await import("../db/services/emailService.js");
    const pendingEmails = await emailService.getPendingScheduledEmails();

    if (pendingSMS.length === 0 && pendingEmails.length === 0) {
      return res.json({ message: "No pending scheduled messages", processed: 0, smsProcessed: 0, emailsProcessed: 0 });
    }

    // Processing scheduled SMS
    const results = [];
    let processedCount = 0;

    // Process SMS in parallel batches of 50 to avoid overwhelming Twilio API
    // This allows processing 1000+ SMS efficiently while respecting rate limits
    const batchSize = 50;
    
    for (let i = 0; i < pendingSMS.length; i += batchSize) {
      const batch = pendingSMS.slice(i, i + batchSize);
      
      // Process batch in parallel (up to 50 at a time)
      const batchPromises = batch.map(async (scheduled) => {
        try {
          // Update status to processing
          await smsService.updateScheduledSMSStatus(scheduled.id, "processing");

          // Send SMS
          const sendResults = await sendBulkSMS(scheduled.recipient_phone_numbers, scheduled.message);
          const successCount = sendResults.filter((r) => r.success).length;

          // Create SMS message record
          const smsRecord = await smsService.createSMSMessage({
            message: scheduled.message,
            recipientType: scheduled.recipient_type,
            recipientGroupId: scheduled.recipient_group_id,
            recipientMemberId: scheduled.recipient_member_id,
            recipientPhoneNumbers: scheduled.recipient_phone_numbers,
            twilioStatus: successCount > 0 ? "sent" : "failed",
            segments: calculateSMSSegments(scheduled.message),
            sentBy: scheduled.created_by,
          });

          // Update scheduled SMS status
          await smsService.updateScheduledSMSStatus(
            scheduled.id,
            successCount > 0 ? "sent" : "failed",
            smsRecord.id,
            successCount === 0 ? "All SMS sends failed" : null
          );

          processedCount++;
          return {
            scheduledSMSId: scheduled.id,
            success: successCount > 0,
            successCount,
            totalRecipients: scheduled.recipient_phone_numbers.length,
          };
        } catch (error) {
          console.error(`Error processing scheduled SMS ${scheduled.id}:`, error);
          await smsService.updateScheduledSMSStatus(scheduled.id, "failed", null, error.message);
          processedCount++;
          return {
            scheduledSMSId: scheduled.id,
            success: false,
            error: error.message,
          };
        }
      });

      // Wait for batch to complete before processing next batch
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Log progress for large batches
      if (pendingSMS.length > 100) {
        // Batch processed
      }
    }

    // Completed processing scheduled SMS

    // Process scheduled emails
    const emailResults = [];
    let emailProcessedCount = 0;

    if (pendingEmails.length > 0) {
      // Processing scheduled emails

      const sendEmail = (await import("../utils/email/sendEmail.js")).default;
      const { groupService } = await import("../db/services/groupService.js");
      const { groupMemberService } = await import("../db/services/groupMemberService.js");

      // Process emails in parallel batches of 10 (SendGrid rate limits are different)
      const emailBatchSize = 10;

      for (let i = 0; i < pendingEmails.length; i += emailBatchSize) {
        const batch = pendingEmails.slice(i, i + emailBatchSize);

        const batchPromises = batch.map(async (scheduled) => {
          try {
            // Update status to processing
            await emailService.updateScheduledEmailStatus(scheduled.id, "processing");

            // Collect recipients from groups - send individual emails for privacy
            let groupToRecipients = [];
            if (scheduled.recipient_group_ids && scheduled.recipient_group_ids.length > 0) {
              for (const groupId of scheduled.recipient_group_ids) {
                const members = await groupMemberService.findByGroupId(groupId);
                const groupEmails = members
                  .filter((m) => m.email && m.email.trim())
                  .map((m) => m.email.trim());
                groupToRecipients.push(...groupEmails);
              }
              groupToRecipients = [...new Set(groupToRecipients)];
            }

            // Combine recipients
            const manualToRecipients = scheduled.to_recipients || [];
            const ccRecipients = scheduled.cc_recipients || [];
            const bccRecipients = scheduled.bcc_recipients || [];

            // Process attachments if stored
            let processedAttachments = null;
            if (scheduled.attachments) {
              // Note: We can't restore base64 content from metadata, so attachments won't be included
              // This is a limitation - we'd need to store full attachment data or use cloud storage
              console.warn(`⚠️ Scheduled email ${scheduled.id} has attachments but they cannot be restored from metadata`);
            }

            // Send individual emails to each group member for privacy
            let successCount = 0;
            let failCount = 0;
            const allToRecipients = [...groupToRecipients, ...manualToRecipients];

            // Send individual emails to group members
            if (groupToRecipients.length > 0) {
              const batchSize = 10;
              for (let i = 0; i < groupToRecipients.length; i += batchSize) {
                const batch = groupToRecipients.slice(i, i + batchSize);
                
                const batchPromises = batch.map(async (recipientEmail) => {
                  try {
                    await sendEmail({
                      to: [recipientEmail], // Send to individual recipient
                      subject: scheduled.subject,
                      html: scheduled.html_content,
                      text: scheduled.text_content,
                      fromName: scheduled.from_name,
                      replyTo: scheduled.reply_to,
                      disableReplyTo: scheduled.disable_reply_to,
                      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
                      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
                      attachments: processedAttachments,
                    });
                    successCount++;
                    return { success: true, email: recipientEmail };
                  } catch (error) {
                    failCount++;
                    console.error(`Error sending scheduled email to ${recipientEmail}:`, error);
                    return { success: false, email: recipientEmail, error: error.message };
                  }
                });

                await Promise.all(batchPromises);
                
                // Small delay between batches
                if (i + batchSize < groupToRecipients.length) {
                  await new Promise(resolve => setTimeout(resolve, 100));
                }
              }
            }

            // Send to manual TO recipients (if any)
            if (manualToRecipients.length > 0) {
              try {
                await sendEmail({
                  to: manualToRecipients,
                  subject: scheduled.subject,
                  html: scheduled.html_content,
                  text: scheduled.text_content,
                  fromName: scheduled.from_name,
                  replyTo: scheduled.reply_to,
                  disableReplyTo: scheduled.disable_reply_to,
                  cc: ccRecipients.length > 0 ? ccRecipients : undefined,
                  bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
                  attachments: processedAttachments,
                });
                successCount += manualToRecipients.length;
              } catch (error) {
                failCount += manualToRecipients.length;
                console.error(`Error sending scheduled email to manual recipients:`, error);
              }
            }

            // If we only have CC/BCC recipients, send one email
            if (allToRecipients.length === 0 && (ccRecipients.length > 0 || bccRecipients.length > 0)) {
              const senderEmail = process.env.SENDGRID_FROM;
              const fallbackTo = senderEmail ? [senderEmail] : (ccRecipients.length > 0 ? [ccRecipients[0]] : [bccRecipients[0]]);
              
              try {
                await sendEmail({
                  to: fallbackTo,
                  subject: scheduled.subject,
                  html: scheduled.html_content,
                  text: scheduled.text_content,
                  fromName: scheduled.from_name,
                  replyTo: scheduled.reply_to,
                  disableReplyTo: scheduled.disable_reply_to,
                  cc: ccRecipients.length > 0 ? ccRecipients : undefined,
                  bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
                  attachments: processedAttachments,
                });
                successCount += fallbackTo.length;
              } catch (error) {
                failCount += fallbackTo.length;
                console.error(`Error sending scheduled email:`, error);
              }
            }

            // Create email message record
            const emailRecord = await emailService.createEmailMessage({
              subject: scheduled.subject,
              htmlContent: scheduled.html_content,
              textContent: scheduled.text_content,
              recipientType: scheduled.recipient_type,
              recipientGroupIds: scheduled.recipient_group_ids || [],
              toRecipients: allToRecipients.length > 0 ? allToRecipients : undefined,
              ccRecipients: ccRecipients.length > 0 ? ccRecipients : undefined,
              bccRecipients: bccRecipients.length > 0 ? bccRecipients : undefined,
              fromName: scheduled.from_name,
              replyTo: scheduled.reply_to,
              disableReplyTo: scheduled.disable_reply_to,
              status: failCount === 0 ? "sent" : failCount < successCount ? "partial" : "failed",
              sentBy: scheduled.created_by,
            });

            // Update scheduled email status
            const finalStatus = failCount === 0 ? "sent" : failCount < successCount ? "partial" : "failed";
            await emailService.updateScheduledEmailStatus(
              scheduled.id,
              finalStatus,
              emailRecord.id,
              failCount > 0 ? `Sent to ${successCount}, failed ${failCount}` : null
            );

            emailProcessedCount++;
            return {
              scheduledEmailId: scheduled.id,
              success: failCount === 0,
              totalRecipients: allToRecipients.length + ccRecipients.length + bccRecipients.length,
              successCount,
              failCount,
            };
          } catch (error) {
            console.error(`Error processing scheduled email ${scheduled.id}:`, error);
            await emailService.updateScheduledEmailStatus(scheduled.id, "failed", null, error.message);
            emailProcessedCount++;
            return {
              scheduledEmailId: scheduled.id,
              success: false,
              error: error.message,
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        emailResults.push(...batchResults);

        if (pendingEmails.length > 20) {
          // Email batch processed
        }
      }

      // Completed processing scheduled emails
    }

    res.json({
      message: "Scheduled messages processed",
      processed: processedCount + emailProcessedCount,
      smsProcessed: processedCount,
      emailsProcessed: emailProcessedCount,
      smsTotal: pendingSMS.length,
      emailsTotal: pendingEmails.length,
      smsResults: results.slice(0, 50), // Return first 50 results to avoid huge response
      emailResults: emailResults.slice(0, 50),
      summary: {
        sms: {
          total: pendingSMS.length,
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
        emails: {
          total: pendingEmails.length,
          successful: emailResults.filter((r) => r.success).length,
          failed: emailResults.filter((r) => !r.success).length,
        },
      },
    });
  } catch (error) {
    console.error("Error processing scheduled SMS:", error);
    res.status(500).json({ message: "Error processing scheduled SMS", error: error.message });
  }
};

/**
 * Get SMS history (includes both sent messages and scheduled)
 */
export const getSMSHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, recipientType, startDate, endDate, includeScheduled = true } = req.query;
    const userId = req.user._id || req.user.id;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get sent messages
    const messages = await smsService.getSMSMessages({
      limit: parseInt(limit, 10) * 2, // Get more to account for scheduled messages
      offset: 0, // We'll merge and sort them, so get from start
      sentBy: userId,
      recipientType: recipientType || null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    // Get scheduled messages if requested
    let scheduledMessages = [];
    if (includeScheduled === "true" || includeScheduled === true) {
      scheduledMessages = await smsService.getScheduledSMS({
        limit: parseInt(limit, 10) * 2,
        offset: 0,
        createdBy: userId,
        status: null, // Get all statuses
        startDate: startDate || null,
        endDate: endDate || null,
      });
    }

    // Get recipient counts for sent SMS messages from recipient logs (more accurate than array length)
    const recipientCountsMap = {};
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);
      try {
        const { query } = await import("../db/postgresConnect.js");
        const result = await query(
          `SELECT sms_message_id, COUNT(*) as count 
           FROM sms_recipient_logs 
           WHERE sms_message_id = ANY($1::uuid[])
           GROUP BY sms_message_id`,
          [messageIds]
        );
        result.rows.forEach(row => {
          recipientCountsMap[row.sms_message_id] = parseInt(row.count, 10);
        });
      } catch (error) {
        console.error("Error getting recipient counts:", error);
      }
    }

    // Helper function to get array length (handles both arrays and string representations)
    const getArrayLength = (arr) => {
      if (!arr) return 0;
      if (Array.isArray(arr)) return arr.length;
      if (typeof arr === 'string') {
        // Try to parse as JSON array
        try {
          const parsed = JSON.parse(arr);
          return Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          // If not JSON, might be PostgreSQL array format like "{item1,item2}"
          if (arr.startsWith('{') && arr.endsWith('}')) {
            const items = arr.slice(1, -1).split(',').filter(item => item.trim());
            return items.length;
          }
          return 0;
        }
      }
      return 0;
    };

    // Combine and sort by date (most recent first)
    const allMessages = [
      ...messages.map(m => ({ 
        ...m, 
        type: "sent", 
        scheduled_for: null,
        // Use actual recipient log count if available (most accurate), 
        // otherwise use SQL-calculated count, otherwise fall back to array parsing
        recipient_count: recipientCountsMap[m.id] !== undefined 
          ? recipientCountsMap[m.id] 
          : (m.recipient_count !== undefined ? parseInt(m.recipient_count, 10) : getArrayLength(m.recipient_phone_numbers))
      })),
      ...scheduledMessages.map(m => ({ 
        ...m, 
        type: "scheduled", 
        sent_at: null, 
        twilio_status: m.status,
        recipient_count: m.recipient_count !== undefined 
          ? parseInt(m.recipient_count, 10) 
          : getArrayLength(m.recipient_phone_numbers)
      }))
    ].sort((a, b) => {
      const dateA = a.sent_at || a.scheduled_for || a.created_at;
      const dateB = b.sent_at || b.scheduled_for || b.created_at;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    // Paginate the combined results
    const total = allMessages.length;
    const paginatedMessages = allMessages.slice(offset, offset + parseInt(limit, 10));

    res.json({
      messages: paginatedMessages,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error("Error getting SMS history:", error);
    res.status(500).json({ message: "Error getting SMS history", error: error.message });
  }
};

/**
 * Get scheduled SMS list
 */
export const getScheduledSMS = async (req, res) => {
  try {
    const { page = 1, limit = 50, status, startDate, endDate } = req.query;
    const userId = req.user._id || req.user.id;

    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const scheduled = await smsService.getScheduledSMS({
      limit: parseInt(limit, 10),
      offset,
      createdBy: userId,
      status: status || null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    res.json({
      scheduledSMS: scheduled,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    console.error("Error getting scheduled SMS:", error);
    res.status(500).json({ message: "Error getting scheduled SMS", error: error.message });
  }
};

/**
 * Cancel a scheduled SMS
 */
export const cancelScheduledSMS = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const scheduled = await smsService.getScheduledSMSById(id);
    if (!scheduled) {
      return res.status(404).json({ message: "Scheduled SMS not found" });
    }

    if (scheduled.created_by !== userId) {
      return res.status(403).json({ message: "You can only cancel your own scheduled SMS" });
    }

    if (scheduled.status !== "pending") {
      return res.status(400).json({ message: "Can only cancel pending scheduled SMS" });
    }

    const cancelled = await smsService.cancelScheduledSMS(id);

    res.json({
      message: "Scheduled SMS cancelled",
      scheduledSMS: cancelled,
    });
  } catch (error) {
    console.error("Error cancelling scheduled SMS:", error);
    res.status(500).json({ message: "Error cancelling scheduled SMS", error: error.message });
  }
};

/**
 * Get SMS recipient details by message ID
 */
export const getSMSRecipients = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Verify the message belongs to the user
    const message = await smsService.getSMSMessageById(id);
    if (!message) {
      return res.status(404).json({ message: "SMS message not found" });
    }

    if (message.sent_by !== userId) {
      return res.status(403).json({ message: "You can only view your own SMS messages" });
    }

    // Get recipient logs
    const recipientLogs = await smsService.getSMSRecipientLogs(id);

    // Log for debugging
    console.log(`[getSMSRecipients] Message ID: ${id}, Found ${recipientLogs.length} recipient logs`);

    // If no recipient logs found, try to create them from the phone numbers array
    if (recipientLogs.length === 0 && message.recipient_phone_numbers) {
      console.log(`[getSMSRecipients] No recipient logs found, but message has ${message.recipient_phone_numbers.length} phone numbers`);
      console.log(`[getSMSRecipients] Phone numbers:`, message.recipient_phone_numbers);
      
      // Try to parse the phone numbers array if it's a string
      let phoneNumbers = message.recipient_phone_numbers;
      if (typeof phoneNumbers === 'string') {
        try {
          phoneNumbers = JSON.parse(phoneNumbers);
        } catch {
          // If not JSON, might be PostgreSQL array format
          if (phoneNumbers.startsWith('{') && phoneNumbers.endsWith('}')) {
            phoneNumbers = phoneNumbers.slice(1, -1).split(',').map(p => p.trim());
          }
        }
      }
      
      if (Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
        console.log(`[getSMSRecipients] Creating recipient logs from phone numbers array`);
        // Create recipient logs from phone numbers (status unknown since we don't have Twilio SIDs)
        const logsToCreate = phoneNumbers.map(phone => ({
          smsMessageId: id,
          phoneNumber: phone,
          twilioSid: null,
          status: message.twilio_status || "sent", // Use message status as default
          errorCode: null,
          errorMessage: null,
        }));
        
        try {
          await smsService.createBulkSMSRecipientLogs(logsToCreate);
          // Fetch again after creating
          const newLogs = await smsService.getSMSRecipientLogs(id);
          console.log(`[getSMSRecipients] Created ${newLogs.length} recipient logs`);
          
          res.json({
            message: message,
            recipients: newLogs,
            summary: {
              total: newLogs.length,
              sent: newLogs.filter(r => r.status === "sent" || r.status === "delivered").length,
              failed: newLogs.filter(r => r.status === "failed" || r.status === "undelivered").length,
              queued: newLogs.filter(r => r.status === "queued").length,
            },
          });
          return;
        } catch (createError) {
          console.error(`[getSMSRecipients] Error creating recipient logs:`, createError);
        }
      }
    }

    res.json({
      message: message,
      recipients: recipientLogs,
      summary: {
        total: recipientLogs.length,
        sent: recipientLogs.filter(r => r.status === "sent" || r.status === "delivered").length,
        failed: recipientLogs.filter(r => r.status === "failed" || r.status === "undelivered").length,
        queued: recipientLogs.filter(r => r.status === "queued").length,
      },
    });
  } catch (error) {
    console.error("Error getting SMS recipients:", error);
    res.status(500).json({ message: "Error getting SMS recipients", error: error.message });
  }
};

/**
 * Update scheduled SMS
 */
export const updateScheduledSMS = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, scheduledFor } = req.body;
    const userId = req.user._id || req.user.id;

    const scheduled = await smsService.getScheduledSMSById(id);
    if (!scheduled) {
      return res.status(404).json({ message: "Scheduled SMS not found" });
    }

    if (scheduled.created_by !== userId) {
      return res.status(403).json({ message: "You can only update your own scheduled SMS" });
    }

    if (scheduled.status !== "pending") {
      return res.status(400).json({ message: "Can only update pending scheduled SMS" });
    }

    // Validate scheduled time
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: "Invalid scheduled time" });
      }
      if (scheduledDate < new Date()) {
        return res.status(400).json({ message: "Scheduled time must be in the future" });
      }
    }

    // Update the scheduled SMS using direct query since we don't have an updateScheduledSMS function
    const { query } = await import("../db/postgresConnect.js");
    const updateClauses = [];
    const values = [];
    let paramIndex = 1;

    if (message) {
      updateClauses.push(`message = $${paramIndex++}`);
      values.push(message);
    }
    if (scheduledFor) {
      updateClauses.push(`scheduled_for = $${paramIndex++}`);
      values.push(new Date(scheduledFor));
    }

    if (updateClauses.length === 0) {
      return res.json({ message: "No updates provided", scheduledSMS: scheduled });
    }

    updateClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE scheduled_sms SET ${updateClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({
      message: "Scheduled SMS updated successfully",
      scheduledSMS: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating scheduled SMS:", error);
    res.status(500).json({ message: "Error updating scheduled SMS", error: error.message });
  }
};

