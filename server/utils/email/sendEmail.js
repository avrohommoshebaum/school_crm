/**
 * Send Email Utility using SendGrid
 * Supports custom from name and reply-to settings
 */

import sgMail from "@sendgrid/mail";

/**
 * Send an email using SendGrid
 * @param {Object} options
 * @param {string|string[]} options.to - Recipient email(s)
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @param {string} [options.fromName] - Custom from name (optional, defaults to system default)
 * @param {string} [options.replyTo] - Reply-to email address (optional)
 * @param {boolean} [options.disableReplyTo] - If true, sets reply-to to no-reply address (optional)
 * @param {string[]} [options.cc] - CC recipients (optional)
 * @param {string[]} [options.bcc] - BCC recipients (optional)
 * @param {string} [options.priority] - Email priority: 'normal' or 'high' (optional)
 * @param {Array} [options.attachments] - Attachments array with {content, filename, type} (optional)
 */
export default async function sendEmail({
  to,
  subject,
  html,
  text,
  fromName,
  replyTo,
  disableReplyTo = false,
  cc,
  bcc,
  priority = "normal",
  attachments,
}) {
  // Set API key dynamically (secrets are loaded from Secret Manager at runtime)
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error(
      "SendGrid API key is not configured. Please set SENDGRID_API_KEY in your environment variables or Google Secret Manager."
    );
  }

  // Set API key each time (in case it was loaded from Secret Manager after module import)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  if (!process.env.SENDGRID_FROM) {
    throw new Error(
      "SendGrid FROM email is not configured. Please set SENDGRID_FROM in your environment variables."
    );
  }

  // Build from address
  const fromEmail = process.env.SENDGRID_FROM;
  
  // Use SendGrid's from object format for better deliverability with display names
  // String format with display names can trigger spam filters more easily
  const from = fromName
    ? {
        email: fromEmail,
        name: fromName.trim(), // Trim whitespace to avoid issues
      }
    : fromEmail;

  // Determine reply-to
  let finalReplyTo;
  if (disableReplyTo) {
    // Use no-reply address
    finalReplyTo = `noreply@${fromEmail.split("@")[1]}`;
  } else if (replyTo) {
    finalReplyTo = replyTo;
  } else {
    // Default to from address
    finalReplyTo = fromEmail;
  }

  // Extract domain from fromEmail for List-Unsubscribe
  const fromDomain = fromEmail.split("@")[1];
  
  const msg = {
    to: Array.isArray(to) ? to : [to],
    from,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML for text version if not provided
    replyTo: finalReplyTo,
    cc: cc && cc.length > 0 ? (Array.isArray(cc) ? cc : [cc]) : undefined,
    bcc: bcc && bcc.length > 0 ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
    headers: {
      priority: priority === "high" ? "urgent" : "normal",
      // List-Unsubscribe header helps with deliverability (required by Gmail/Outlook)
      // Only add if fromName is used (indicates it might be marketing/bulk)
      ...(fromName ? {
        "List-Unsubscribe": `<mailto:unsubscribe@${fromDomain}?subject=unsubscribe>, <https://${fromDomain}/unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      } : {}),
      // X-Mailer header for identification
      "X-Mailer": "Nachlas Bais Yaakov Portal",
      // NOTE: Removed "Precedence: bulk" header - this causes emails with display names to go to spam
      // Only use "Precedence: bulk" for actual marketing/bulk emails, not transactional emails
    },
    // Mail settings for better deliverability
    mailSettings: {
      // Enable sandbox mode only in development (disables actual sending)
      sandboxMode: {
        enable: process.env.NODE_ENV === "development" && process.env.SENDGRID_SANDBOX === "true",
      },
      // Spam check (optional - can help identify issues)
      spamCheck: {
        enable: false, // Set to true if you want SendGrid to check for spam
        threshold: 5,
        postToUrl: undefined,
      },
    },
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
      openTracking: { enable: false },
    },
  };

  try {
    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    if (error.code === 401) {
      const errorDetails =
        error.response?.body?.errors?.[0]?.message || "Invalid API key";
      throw new Error(
        `SendGrid authentication failed: ${errorDetails}. Please verify your SENDGRID_API_KEY is correct and has not expired.`
      );
    }
    throw error;
  }
}

