export default ({ resetLink }) => `
<h2>Password Reset Request</h2>
<p>Click below to reset your password:</p>
<a href="${resetLink}" style="padding:10px 20px;background:#1976d2;color:#fff;border-radius:6px;text-decoration:none;">
  Reset Password
</a>
<p>This link expires in 1 hour.</p>
`;
