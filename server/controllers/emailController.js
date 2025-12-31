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

    // Collect email recipients from groups - these go in BCC (so recipients can't see each other)
    let groupBccRecipients = [];
    
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
        
        groupBccRecipients.push(...groupEmails);
      }
    }

    // Remove duplicates from group recipients
    groupBccRecipients = [...new Set(groupBccRecipients)];

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

    // Combine all recipients
    const toRecipients = manualToRecipients.length > 0 ? manualToRecipients : undefined;
    
    // Parse CC and BCC if they're strings, then combine with manual CC/BCC
    const ccArray = cc
      ? Array.isArray(cc)
        ? cc
        : cc.split(",").map((e) => e.trim()).filter((e) => e)
      : [];
    const combinedCc = [...new Set([...ccArray, ...manualCcRecipients])];
    
    // Combine BCC: group recipients + manual BCC + existing BCC
    const bccArray = bcc
      ? Array.isArray(bcc)
        ? bcc
        : bcc.split(",").map((e) => e.trim()).filter((e) => e)
      : [];
    const combinedBcc = [...new Set([...groupBccRecipients, ...manualBccRecipients, ...bccArray])];

    // Must have at least one recipient
    if (!toRecipients && combinedCc.length === 0 && combinedBcc.length === 0) {
      return res
        .status(400)
        .json({ message: "No email recipients found. Please select groups or enter email addresses." });
    }

    // SendGrid requires at least one TO recipient
    // If we only have BCC recipients (from groups), use the sender's email as TO
    let finalToRecipients = toRecipients;
    if (!finalToRecipients || finalToRecipients.length === 0) {
      // Use sender's email as TO when we only have BCC recipients
      // This ensures privacy - recipients only see the sender, not each other
      const senderEmail = process.env.SENDGRID_FROM;
      if (senderEmail) {
        finalToRecipients = [senderEmail];
      } else if (combinedBcc.length > 0) {
        // Fallback: use first BCC as TO (they'll see themselves as TO, but others won't see them)
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
      const scheduledEmail = await emailService.createScheduledEmail({
        subject: subject.trim(),
        htmlContent: html,
        textContent: text || null,
        recipientType,
        recipientGroupIds: groupIds || [],
        toRecipients: finalToRecipients || [],
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
      const totalRecipients = (finalToRecipients?.length || 0) + combinedCc.length + combinedBcc.length;

      return res.json({
        message: "Email scheduled successfully",
        scheduledEmailId: scheduledEmail.id,
        scheduledFor: scheduledEmail.scheduled_for,
        recipientsCount: totalRecipients,
      });
    }

    // Send email immediately
    let sendgridMessageId = null;
    try {
      const sendResult = await sendEmail({
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
      
      // Extract SendGrid message ID if available
      if (sendResult && sendResult[0] && sendResult[0].headers && sendResult[0].headers["x-message-id"]) {
        sendgridMessageId = sendResult[0].headers["x-message-id"];
      }
    } catch (error) {
      // Store failed email in history
      await emailService.createEmailMessage({
        subject: subject.trim(),
        htmlContent: html,
        textContent: text || null,
        recipientType,
        recipientGroupIds: groupIds || [],
        toRecipients: finalToRecipients || [],
        ccRecipients: combinedCc,
        bccRecipients: combinedBcc,
        fromName: fromName || null,
        replyTo: replyTo || null,
        disableReplyTo: disableReplyTo || false,
        status: "failed",
        sentBy: userId,
      });
      
      throw error;
    }

    // Store email in history
    await emailService.createEmailMessage({
      subject: subject.trim(),
      htmlContent: html,
      textContent: text || null,
      recipientType,
      recipientGroupIds: groupIds || [],
      toRecipients: finalToRecipients || [],
      ccRecipients: combinedCc,
      bccRecipients: combinedBcc,
      fromName: fromName || null,
      replyTo: replyTo || null,
      disableReplyTo: disableReplyTo || false,
      sendgridMessageId,
      status: "sent",
      sentBy: userId,
    });

    // Calculate total recipient count
    const totalRecipients = (finalToRecipients?.length || 0) + combinedCc.length + combinedBcc.length;

    res.json({
      message: "Email sent successfully",
      recipientsCount: totalRecipients,
    });
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
export const getEmailHistory = async (req, res) => {
  try {
    const { page = 1, limit = 50, type = null, startDate = null, endDate = null } = req.query;

    const emails = await emailService.getEmailMessages({
      page: parseInt(page),
      limit: parseInt(limit),
      recipientType: type || null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    const scheduledEmails = await emailService.getScheduledEmails({
      page: parseInt(page),
      limit: parseInt(limit),
      status: null,
      startDate: startDate || null,
      endDate: endDate || null,
    });

    // Combine and format for client
    const combined = [
      ...emails.map((e) => ({
        id: e.id,
        type: "email",
        messageType: "sent",
        subject: e.subject,
        preview: e.html_content ? e.html_content.replace(/<[^>]*>/g, "").substring(0, 100) : "",
        recipientType: e.recipient_type,
        recipientCount: (e.to_recipients?.length || 0) + (e.cc_recipients?.length || 0) + (e.bcc_recipients?.length || 0),
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
        recipientCount: (se.to_recipients?.length || 0) + (se.cc_recipients?.length || 0) + (se.bcc_recipients?.length || 0),
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

