// server/utils/emailTemplates/resetEmailTemplate.js

const resetEmailTemplate = ({ resetLink }) => {
  const logoUrl = "https://storage.googleapis.com/nachlas_app_logos/logo%20blue%20for%20id%20badge.png";
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Nachlas Bais Yaakov Portal</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); overflow: hidden;">
          <!-- Header with Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); padding: 40px 30px; text-align: center;">
              <img src="${logoUrl}" alt="Nachlas Bais Yaakov" style="max-width: 200px; height: auto; margin-bottom: 10px;" />
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600; letter-spacing: 0.5px;">
                Nachlas Bais Yaakov
              </h1>
              <p style="margin: 5px 0 0 0; color: #e3f2fd; font-size: 14px; font-weight: 300;">
                School Management Portal
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1976d2; font-size: 22px; font-weight: 600;">
                Password Reset Request 🔒
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                We received a request to reset your password for your <strong>Nachlas Bais Yaakov Portal</strong> account.
              </p>
              
              <p style="margin: 0 0 30px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                Click the button below to create a new password. If you didn't request this, you can safely ignore this email.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <a href="${resetLink}" 
                       style="display: inline-block; background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%); 
                              color: #ffffff; text-decoration: none; padding: 16px 40px; 
                              border-radius: 6px; font-weight: 600; font-size: 16px; 
                              box-shadow: 0 4px 6px rgba(25, 118, 210, 0.3); 
                              transition: all 0.3s ease;">
                      Reset My Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Alternative Link -->
              <p style="margin: 0 0 30px 0; color: #666666; font-size: 14px; line-height: 1.6;">
                Or copy and paste this link into your browser:<br/>
                <a href="${resetLink}" style="color: #1976d2; word-break: break-all;">${resetLink}</a>
              </p>
              
              <!-- Security Warning -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" 
                     style="background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px; padding: 15px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                      <strong>⚠️ Security Notice:</strong> This password reset link will expire in <strong>1 hour</strong> for your security. 
                      If you didn't request this reset, please contact support immediately.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Tips -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" 
                     style="background-color: #f8f9fa; border-radius: 4px; padding: 20px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; color: #333333; font-size: 14px; font-weight: 600;">
                      💡 Password Security Tips:
                    </p>
                    <ul style="margin: 0; padding-left: 20px; color: #666666; font-size: 13px; line-height: 1.8;">
                      <li>Use a unique password that you don't use elsewhere</li>
                      <li>Include a mix of letters, numbers, and special characters</li>
                      <li>Make it at least 8 characters long</li>
                      <li>Never share your password with anyone</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f5f5f5; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 10px 0; color: #666666; font-size: 12px; line-height: 1.6;">
                If you didn't request a password reset, please ignore this email or contact support if you have concerns.
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © ${new Date().getFullYear()} Nachlas Bais Yaakov. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

export default resetEmailTemplate;
