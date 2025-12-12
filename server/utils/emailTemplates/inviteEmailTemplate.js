// server/utils/emailTemplates/inviteEmail.js

const inviteEmailTemplate = ({ inviteLink }) => {
  return `
  <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.5;">
    <h2 style="color: #1976d2;">Welcome to Nachlas Bais Yaakov Portal</h2>

    <p>You have been invited to join the school portal.</p>

    <p>
      Click the link below to set up your account:
      <br /><br />
      <a href="${inviteLink}"
         style="background: #1976d2; color: white; padding: 12px 20px;
                border-radius: 6px; text-decoration: none; font-weight: bold;">
        Create Your Account
      </a>
    </p>

    <p>This link will expire in 7 days.</p>

    <hr style="margin-top: 30px;" />

    <p style="font-size: 12px; color: #555;">
      If you did not expect this invitation, you may ignore this email.
    </p>
  </div>
  `;
}

export default inviteEmailTemplate;
