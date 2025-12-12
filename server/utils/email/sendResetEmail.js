import sgMail from "@sendgrid/mail";
import resetEmailTemplate from "../emailTemplates/resetEmailTemplate.js";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async function sendResetEmail({ to, resetLink }) {
  const html = resetEmailTemplate({ resetLink });

  await sgMail.send({
    to,
    from: process.env.SENDGRID_FROM,
    subject: "Reset your Nachlas Bais Yaakov Portal password",
    html,
    trackingSettings: {
      clickTracking: { enable: false, enableText: false }
    }
  });
}
