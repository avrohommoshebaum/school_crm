// server/utils/email/sendInviteEmail.js
import sgMail from "@sendgrid/mail";
import inviteEmailTemplate from "../emailTemplates/inviteEmailTemplate.js";

const sendInviteEmail = async ({ to, inviteLink }) =>  {
  // Set API key dynamically (secrets are loaded from Secret Manager at runtime)
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key is not configured. Please set SENDGRID_API_KEY in your environment variables or Google Secret Manager.");
  }
  
  // Set API key each time (in case it was loaded from Secret Manager after module import)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  if (!process.env.SENDGRID_FROM) {
    throw new Error("SendGrid FROM email is not configured. Please set SENDGRID_FROM in your environment variables.");
  }

  const html = inviteEmailTemplate({ inviteLink });

  const msg = {
    to,
    from: process.env.SENDGRID_FROM,
    subject: "Nachlas Bais Yaakov Portal — Invitation",
    html,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false },
    }
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    if (error.code === 401) {
      const errorDetails = error.response?.body?.errors?.[0]?.message || "Invalid API key";
      throw new Error(`SendGrid authentication failed: ${errorDetails}. Please verify your SENDGRID_API_KEY is correct and has not expired.`);
    }
    throw error;
  }
}

export default sendInviteEmail;