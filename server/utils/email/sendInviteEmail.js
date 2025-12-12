// server/utils/email/sendInviteEmail.js
import dotenv from "dotenv";
import sgMail from "@sendgrid/mail";
import inviteEmailTemplate from "../emailTemplates/inviteEmailTemplate.js";

if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendInviteEmail = async ({ to, inviteLink }) =>  {
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

  await sgMail.send(msg);
}

export default sendInviteEmail;