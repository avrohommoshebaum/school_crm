/**
 * Email Controller
 * Handles sending emails to groups or individual recipients
 */

import sendEmail from "../utils/email/sendEmail.js";
import { groupService } from "../db/services/groupService.js";
import { groupMemberService } from "../db/services/groupMemberService.js";
import { emailService } from "../db/services/emailService.js";

/**
 * Send email to groups and/or manual email addresses
 */
export const sendEmailToGroup = async (req, res) => {
  try {
    const {
      groupIds,
      manualRecipients,
      subject,
      html,
      text,
      fromName,
      replyTo,
      disableReplyTo,
      cc,
      bcc,
      priority,
      attachments,
      scheduledFor, // For scheduling
    } = req.body;
    
    const userId = req.user._id || req.user.id;

    if (!subject || !html) {
      return res
        .status(400)
        .json({ message: "Subject and HTML content are required" });
    }

    // Collect email recipients from groups - these go in TO field
    let groupToRecipients = [];
    
    if (groupIds && Array.isArray(groupIds) && groupIds.length > 0) {
      for (const groupId of groupIds) {
        const group = await groupService.findById(groupId);
        if (!group) {
          return res.status(404).json({ message: `Group ${groupId} not found` });
        }

        // Get group members with emails
        const members = await groupMemberService.findByGroupId(groupId);
        const groupEmails = members
          .filter((m) => m.email && m.email.trim())
          .map((m) => m.email.trim());
        
        groupToRecipients.push(...groupEmails);
      }
    }

    // Remove duplicates from group recipients
    groupToRecipients = [...new Set(groupToRecipients)];

    // Manual recipients - can be TO, CC, or BCC based on manualRecipientType
    let manualToRecipients = [];
    let manualCcRecipients = [];
    let manualBccRecipients = [];
    const manualRecipientType = req.body.manualRecipientType || "to"; // "to", "cc", or "bcc"

    if (manualRecipients && typeof manualRecipients === "string" && manualRecipients.trim()) {
      const manualEmails = manualRecipients
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e && e.includes("@"));
      
      if (manualRecipientType === "to") {
        manualToRecipients = manualEmails;
      } else if (manualRecipientType === "cc") {
        manualCcRecipients = manualEmails;
      } else if (manualRecipientType === "bcc") {
        manualBccRecipients = manualEmails;
      }
    } else if (Array.isArray(manualRecipients)) {
      const manualEmails = manualRecipients
        .map((e) => (typeof e === "string" ? e.trim() : e))
        .filter((e) => e && (typeof e === "string" ? e.includes("@") : true));
      
      if (manualRecipientType === "to") {
        manualToRecipients = manualEmails;
      } else if (manualRecipientType === "cc") {
        manualCcRecipients = manualEmails;
      } else if (manualRecipientType === "bcc") {
        manualBccRecipients = manualEmails;
      }
    }

    // Combine all TO recipients: group recipients + manual TO recipients
    const combinedToRecipients = [...new Set([...groupToRecipients, ...manualToRecipients])];
    
    // Parse CC and BCC if they're strings, then combine with manual CC/BCC
    const ccArray = cc
      ? Array.isArray(cc)
        ? cc
        : cc.split(",").map((e) => e.trim()).filter((e) => e)
      : [];
    const combinedCc = [...new Set([...ccArray, ...manualCcRecipients])];
    
    // Combine BCC: manual BCC + existing BCC (group recipients are now in TO, not BCC)
    const bccArray = bcc
      ? Array.isArray(bcc)
        ? bcc
        : bcc.split(",").map((e) => e.trim()).filter((e) => e)
      : [];
    const combinedBcc = [...new Set([...manualBccRecipients, ...bccArray])];

    // Must have at least one recipient
    if (combinedToRecipients.length === 0 && combinedCc.length === 0 && combinedBcc.length === 0) {
      return res
        .status(400)
        .json({ message: "No email recipients found. Please select groups or enter email addresses." });
    }

    // SendGrid requires at least one TO recipient
    let finalToRecipients = combinedToRecipients.length > 0 ? combinedToRecipients : undefined;
    if (!finalToRecipients || finalToRecipients.length === 0) {
      // If we only have CC/BCC recipients, use the first CC as TO (or first BCC if no CC)
      if (combinedCc.length > 0) {
        finalToRecipients = [combinedCc[0]];
      } else if (combinedBcc.length > 0) {
        finalToRecipients = [combinedBcc[0]];
      } else {
        return res.status(400).json({ 
          message: "At least one recipient is required. Please add recipients in To, CC, or BCC." 
        });
      }
    }

    // Process attachments (expecting base64 encoded files from frontend)
    let processedAttachments;
    if (attachments && Array.isArray(attachments) && attachments.length > 0) {
      processedAttachments = attachments.map((att) => ({
        content: att.content, // Base64 string
        filename: att.filename,
        type: att.type || "application/octet-stream",
        disposition: "attachment",
      }));
    }

    // Determine recipient type
    const recipientType = groupIds && groupIds.length > 0 ? "group" : "manual";

    // If scheduledFor is provided, schedule the email instead of sending immediately
    if (scheduledFor) {
      const scheduledDate = new Date(scheduledFor);
      if (isNaN(scheduledDate.getTime())) {
        return res.status(400).json({ message: "Invalid scheduledFor date/time" });
      }

      if (scheduledDate < new Date()) {
        return res.status(400).json({ message: "Scheduled time must be in the future" });
      }

      // Create scheduled email record
      // Store all group recipients in toRecipients for scheduled emails
      const allScheduledToRecipients = [...groupToRecipients, ...manualToRecipients];
      const scheduledToRecipients = allScheduledToRecipients.length > 0 ? allScheduledToRecipients : finalToRecipients;
      
      const scheduledEmail = await emailService.createScheduledEmail({
        subject: subject.trim(),
        htmlContent: html,
        textContent: text || null,
        recipientType,
        recipientGroupIds: groupIds || [],
        toRecipients: scheduledToRecipients || [],
        ccRecipients: combinedCc,
        bccRecipients: combinedBcc,
        fromName: fromName || null,
        replyTo: replyTo || null,
        disableReplyTo: disableReplyTo || false,
        attachments: processedAttachments ? processedAttachments.map(att => ({
          filename: att.filename,
          type: att.type,
        })) : null,
        scheduledFor: scheduledDate.toISOString(),
        createdBy: userId,
      });

      // Calculate total recipient count
      const totalRecipients = (scheduledToRecipients?.length || 0) + combinedCc.length + combinedBcc.length;

      return res.json({
        message: "Email scheduled successfully",
        scheduledEmailId: scheduledEmail.id,
        scheduledFor: scheduledEmail.scheduled_for,
        recipientsCount: totalRecipients,
      });
    }

    // Send email immediately
    // For privacy, send individual emails to each group member
    // Manual TO recipients can be sent together (they're explicitly added)
    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // Send individual emails to each group member
    if (groupToRecipients.length > 0) {
      // Process in batches to avoid overwhelming SendGrid
      const batchSize = 10;
      for (let i = 0; i < groupToRecipients.length; i += batchSize) {
        const batch = groupToRecipients.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (recipientEmail) => {
          try {
            await sendEmail({
              to: [recipientEmail], // Send to individual recipient
              subject,
              html,
              text,
              fromName,
              replyTo,
              disableReplyTo,
              cc: combinedCc.length > 0 ? combinedCc : undefined,
              bcc: combinedBcc.length > 0 ? combinedBcc : undefined,
              priority: priority || "normal",
              attachments: processedAttachments,
            });
            successCount++;
            return { success: true, email: recipientEmail };
          } catch (error) {
            failCount++;
            const errorMsg = error.message || "Failed to send email";
            errors.push({ email: recipientEmail, error: errorMsg });
            console.error(`Error sending email to ${recipientEmail}:`, error);
            return { success: false, email: recipientEmail, error: errorMsg };
          }
        });

        await Promise.all(batchPromises);
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < groupToRecipients.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Send to manual TO recipients (if any) - these can be sent together since they're explicitly added
    if (manualToRecipients.length > 0) {
      try {
        await sendEmail({
          to: manualToRecipients,
          subject,
          html,
          text,
          fromName,
          replyTo,
          disableReplyTo,
          cc: combinedCc.length > 0 ? combinedCc : undefined,
          bcc: combinedBcc.length > 0 ? combinedBcc : undefined,
          priority: priority || "normal",
          attachments: processedAttachments,
        });
        successCount += manualToRecipients.length;
      } catch (error) {
        failCount += manualToRecipients.length;
        const errorMsg = error.message || "Failed to send email";
        errors.push({ emails: manualToRecipients, error: errorMsg });
        console.error(`Error sending email to manual recipients:`, error);
      }
    }

    // If we only have CC/BCC recipients (no TO), send one email with them
    if (groupToRecipients.length === 0 && manualToRecipients.length === 0 && (combinedCc.length > 0 || combinedBcc.length > 0)) {
      try {
        await sendEmail({
          to: finalToRecipients,
          subject,
          html,
          text,
          fromName,
          replyTo,
          disableReplyTo,
          cc: combinedCc.length > 0 ? combinedCc : undefined,
          bcc: combinedBcc.length > 0 ? combinedBcc : undefined,
          priority: priority || "normal",
          attachments: processedAttachments,
        });
        successCount += finalToRecipients.length;
      } catch (error) {
        failCount += finalToRecipients.length;
        const errorMsg = error.message || "Failed to send email";
        errors.push({ emails: finalToRecipients, error: errorMsg });
        console.error(`Error sending email:`, error);
      }
    }

    // Store email in history (one record for the entire send operation)
    const allToRecipients = [...groupToRecipients, ...manualToRecipients];
    const finalToForHistory = allToRecipients.length > 0 ? allToRecipients : finalToRecipients;
    
    await emailService.createEmailMessage({
      subject: subject.trim(),
      htmlContent: html,
      textContent: text || null,
      recipientType,
      recipientGroupIds: groupIds || [],
      toRecipients: finalToForHistory || [],
      ccRecipients: combinedCc,
      bccRecipients: combinedBcc,
      fromName: fromName || null,
      replyTo: replyTo || null,
      disableReplyTo: disableReplyTo || false,
      status: failCount === 0 ? "sent" : failCount < successCount ? "partial" : "failed",
      sentBy: userId,
    });

    // Calculate total recipient count
    const totalRecipients = (finalToForHistory?.length || 0) + combinedCc.length + combinedBcc.length;

    // Return appropriate response based on results
    if (failCount === 0) {
      res.json({
        message: "Email sent successfully",
        recipientsCount: totalRecipients,
        successCount,
      });
    } else if (successCount > 0) {
      res.status(207).json({
        message: `Email sent to ${successCount} recipient(s), ${failCount} failed`,
        recipientsCount: totalRecipients,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } else {
      res.status(500).json({
        message: "Failed to send email to all recipients",
        recipientsCount: totalRecipients,
        successCount,
        failCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: error.message || "Failed to send email",
    });
  }
};

/**
 * Send email to individual recipients
 */
export const sendEmailToRecipients = async (req, res) => {
  try {
    const {
      recipients,
      subject,
      html,
      text,
      fromName,
      replyTo,
      disableReplyTo,
      cc,
      bcc,
      priority,
    } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ message: "At least one recipient is required" });
    }

    if (!subject || !html) {
      return res
        .status(400)
        .json({ message: "Subject and HTML content are required" });
    }

    // Clean and validate email addresses
    const emailRecipients = recipients
      .map((e) => (typeof e === "string" ? e.trim() : e.email?.trim()))
      .filter((e) => e && e.includes("@"));

    if (emailRecipients.length === 0) {
      return res.status(400).json({ message: "No valid email addresses provided" });
    }

    // Parse CC and BCC if they're strings
    const ccArray = cc
      ? Array.isArray(cc)
        ? cc
        : cc.split(",").map((e) => e.trim()).filter((e) => e)
      : undefined;
    const bccArray = bcc
      ? Array.isArray(bcc)
        ? bcc
        : bcc.split(",").map((e) => e.trim()).filter((e) => e)
      : undefined;

    // Send email
    await sendEmail({
      to: emailRecipients,
      subject,
      html,
      text,
      fromName,
      replyTo,
      disableReplyTo,
      cc: ccArray,
      bcc: bccArray,
      priority: priority || "normal",
    });

    res.json({
      message: "Email sent successfully",
      recipientsCount: emailRecipients.length,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      message: error.message || "Failed to send email",
    });
  }
};

/**
 * Get email history (includes both sent messages and scheduled)
 */
/**
 * Get email recipient details by message ID
 */
export const getEmailRecipients = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    // Verify the message belongs to the user
    const message = await emailService.getEmailMessageById(id);
    if (!message) {
      return res.status(404).json({ message: "Email message not found" });
    }

    if (message.sent_by !== userId) {
      return res.status(403).json({ message: "You can only view your own email messages" });
    }

    // Helper function to parse array (handles both arrays and string representations)
    const parseArray = (arr) => {
      if (!arr) return [];
      if (Array.isArray(arr)) return arr;
      if (typeof arr === 'string') {
        try {
          const parsed = JSON.parse(arr);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          // If not JSON, might be PostgreSQL array format like "{item1,item2}"
          if (arr.startsWith('{') && arr.endsWith('}')) {
            return arr.slice(1, -1).split(',').map(item => item.trim()).filter(item => item);
          }
          return [];
        }
      }
      return [];
    };

    // Extract recipients from arrays
    const toRecipients = parseArray(message.to_recipients);
    const ccRecipients = parseArray(message.cc_recipients);
    const bccRecipients = parseArray(message.bcc_recipients);

    // Build recipient list with their type (TO, CC, BCC)
    const recipients = [
      ...toRecipients.map(email => ({
        id: `to-${email}`, // Simple ID for frontend
        email: email,
        type: 'to',
        status: message.status || 'sent',
        created_at: message.sent_at || message.created_at,
      })),
      ...ccRecipients.map(email => ({
        id: `cc-${email}`,
        email: email,
        type: 'cc',
        status: message.status || 'sent',
        created_at: message.sent_at || message.created_at,
      })),
      ...bccRecipients.map(email => ({
        id: `bcc-${email}`,
        email: email,
        type: 'bcc',
        status: message.status || 'sent',
        created_at: message.sent_at || message.created_at,
      })),
    ];

    // Calculate summary
    const total = recipients.length;
    const sent = recipients.filter(r => r.status === 'sent').length;
    const failed = recipients.filter(r => r.status === 'failed').length;

    res.json({
      message: {
        id: message.id,
        subject: message.subject,
        type: 'email',
        status: message.status,
        sent_at: message.sent_at,
        created_at: message.created_at,
      },
      recipients: recipients,
      summary: {
        total: total,
        sent: sent,
        failed: failed,
        queued: 0, // Emails don't have queued status
        to: toRecipients.length,
        cc: ccRecipients.length,
        bcc: bccRecipients.length,
      },
    });
  } catch (error) {
    console.error("Error getting email recipients:", error);
    res.status(500).json({ message: "Error getting email recipients", error: error.message });
  }
};

export const getEmailHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, type = null, startDate = null, endDate = null } = req.query;
    const userId = req.user._id || req.user.id;

    const emails = await emailService.getEmailMessages({
      page: parseInt(page),
      limit: parseInt(limit),
      sentBy: userId,
      recipientType: type || null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    const scheduledEmails = await emailService.getScheduledEmails({
      page: parseInt(page),
      limit: parseInt(limit),
      createdBy: userId,
      status: null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

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

    // Combine and format for client
    const combined = [
      ...emails.map((e) => ({
        id: e.id,
        type: "email",
        messageType: "sent",
        subject: e.subject,
        preview: e.html_content ? e.html_content.replace(/<[^>]*>/g, "").substring(0, 100) : "",
        recipientType: e.recipient_type,
        // Use SQL-calculated count if available, otherwise calculate from arrays
        recipientCount: e.recipient_count !== undefined 
          ? parseInt(e.recipient_count, 10)
          : getArrayLength(e.to_recipients) + getArrayLength(e.cc_recipients) + getArrayLength(e.bcc_recipients),
        status: e.status,
        sentAt: e.sent_at,
        sentBy: e.sent_by_name || e.sent_by_email,
        createdAt: e.created_at,
      })),
      ...scheduledEmails.map((se) => ({
        id: se.id,
        type: "email",
        messageType: "scheduled",
        subject: se.subject,
        preview: se.html_content ? se.html_content.replace(/<[^>]*>/g, "").substring(0, 100) : "",
        recipientType: se.recipient_type,
        recipientCount: se.recipient_count !== undefined 
          ? parseInt(se.recipient_count, 10)
          : getArrayLength(se.to_recipients) + getArrayLength(se.cc_recipients) + getArrayLength(se.bcc_recipients),
        status: se.status,
        scheduledFor: se.scheduled_for,
        sentAt: se.sent_at,
        sentBy: se.created_by_name || se.created_by_email,
        createdAt: se.created_at,
      })),
    ].sort((a, b) => {
      const dateA = a.sentAt || a.scheduledFor || a.createdAt;
      const dateB = b.sentAt || b.scheduledFor || b.createdAt;
      return new Date(dateB) - new Date(dateA);
    });

    res.json({
      messages: combined.slice(0, parseInt(limit)),
      total: combined.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error getting email history:", error);
    res.status(500).json({ message: "Error getting email history", error: error.message });
  }
};

/**
 * Get scheduled emails
 */
export const getScheduledEmails = async (req, res) => {
  try {
    const { page = 1, limit = 50, status = null, startDate = null, endDate = null } = req.query;

    const scheduledEmails = await emailService.getScheduledEmails({
      page: parseInt(page),
      limit: parseInt(limit),
      status: status || null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    res.json({
      scheduledEmails,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error("Error getting scheduled emails:", error);
    res.status(500).json({ message: "Error getting scheduled emails", error: error.message });
  }
};

/**
 * Cancel a scheduled email
 */
export const cancelScheduledEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    const scheduled = await emailService.getScheduledEmailById(id);
    if (!scheduled) {
      return res.status(404).json({ message: "Scheduled email not found" });
    }

    if (scheduled.created_by !== userId) {
      return res.status(403).json({ message: "You can only cancel your own scheduled emails" });
    }

    const cancelled = await emailService.cancelScheduledEmail(id);
    if (!cancelled) {
      return res.status(400).json({ message: "Can only cancel pending scheduled emails" });
    }

    res.json({ message: "Scheduled email cancelled successfully", scheduledEmail: cancelled });
  } catch (error) {
    console.error("Error cancelling scheduled email:", error);
    res.status(500).json({ message: "Error cancelling scheduled email", error: error.message });
  }
};

/**
 * Update a scheduled email
 */
export const updateScheduledEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, html, scheduledFor } = req.body;
    const userId = req.user._id || req.user.id;

    const scheduled = await emailService.getScheduledEmailById(id);
    if (!scheduled) {
      return res.status(404).json({ message: "Scheduled email not found" });
    }

    if (scheduled.created_by !== userId) {
      return res.status(403).json({ message: "You can only update your own scheduled emails" });
    }

    if (scheduled.status !== "pending") {
      return res.status(400).json({ message: "Can only update pending scheduled emails" });
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

    // Update the scheduled email
    const { query } = await import("../db/postgresConnect.js");
    const updateClauses = [];
    const values = [];
    let paramIndex = 1;

    if (subject) {
      updateClauses.push(`subject = $${paramIndex++}`);
      values.push(subject);
    }

    if (html) {
      updateClauses.push(`html_content = $${paramIndex++}`);
      values.push(html);
    }

    if (scheduledFor) {
      updateClauses.push(`scheduled_for = $${paramIndex++}`);
      values.push(new Date(scheduledFor));
    }

    if (updateClauses.length === 0) {
      return res.json({ message: "No updates provided", scheduledEmail: scheduled });
    }

    updateClauses.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE scheduled_emails SET ${updateClauses.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    res.json({
      message: "Scheduled email updated successfully",
      scheduledEmail: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating scheduled email:", error);
    res.status(500).json({ message: "Error updating scheduled email", error: error.message });
  }
};

