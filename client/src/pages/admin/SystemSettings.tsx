import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Divider,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EmailIcon from '@mui/icons-material/Email';
import SmsIcon from '@mui/icons-material/Sms';
import PhoneIcon from '@mui/icons-material/Phone';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';

export default function SystemSettings() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [emailSettings, setEmailSettings] = useState({
    provider: 'smtp',
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'notifications@nachlasbaisyaakov.org',
    smtpPassword: '••••••••',
    fromName: 'Nachlas Bais Yaakov',
    fromEmail: 'noreply@nachlasbaisyaakov.org',
  });

  const [smsSettings, setSmsSettings] = useState({
    provider: 'twilio',
    accountSid: 'AC••••••••••••••••••••••••••••••••',
    authToken: '••••••••••••••••••••••••••••••••',
    phoneNumber: '+17325551234',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: false,
    parentNotifications: true,
    teacherNotifications: true,
    adminNotifications: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '60',
    passwordExpiry: '90',
    minPasswordLength: '8',
    requireSpecialChars: true,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    retentionDays: '30',
  });

  const handleSave = () => {
    // TODO: API call to save system settings
    setSnackbar({ open: true, message: 'System settings saved successfully!', severity: 'success' });
  };

  const handleTestEmail = () => {
    setSnackbar({ open: true, message: 'Test email sent successfully!', severity: 'success' });
  };

  const handleTestSMS = () => {
    setSnackbar({ open: true, message: 'Test SMS sent successfully!', severity: 'success' });
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          System Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure email, SMS, notifications, security, and backup settings
        </Typography>
      </Box>

      {/* Email Configuration */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <EmailIcon color="primary" />
          <Typography variant="h6">Email Configuration</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Email Provider</InputLabel>
              <Select
                value={emailSettings.provider}
                label="Email Provider"
                onChange={(e) => setEmailSettings({ ...emailSettings, provider: e.target.value })}
              >
                <MenuItem value="smtp">SMTP</MenuItem>
                <MenuItem value="sendgrid">SendGrid</MenuItem>
                <MenuItem value="mailgun">Mailgun</MenuItem>
                <MenuItem value="ses">Amazon SES</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center" height="100%">
              <Chip label="Connected" color="success" />
              <Button variant="outlined" size="small" onClick={handleTestEmail}>
                Send Test Email
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Host"
              value={emailSettings.smtpHost}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Port"
              value={emailSettings.smtpPort}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Username"
              value={emailSettings.smtpUser}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="SMTP Password"
              type="password"
              value={emailSettings.smtpPassword}
              onChange={(e) => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Name"
              value={emailSettings.fromName}
              onChange={(e) => setEmailSettings({ ...emailSettings, fromName: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="From Email"
              type="email"
              value={emailSettings.fromEmail}
              onChange={(e) => setEmailSettings({ ...emailSettings, fromEmail: e.target.value })}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* SMS Configuration (Twilio) */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <SmsIcon color="primary" />
          <Typography variant="h6">SMS Configuration (Twilio)</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>SMS Provider</InputLabel>
              <Select
                value={smsSettings.provider}
                label="SMS Provider"
                onChange={(e) => setSmsSettings({ ...smsSettings, provider: e.target.value })}
              >
                <MenuItem value="twilio">Twilio</MenuItem>
                <MenuItem value="messagebird">MessageBird</MenuItem>
                <MenuItem value="nexmo">Nexmo/Vonage</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} alignItems="center" height="100%">
              <Chip label="Connected" color="success" />
              <Button variant="outlined" size="small" onClick={handleTestSMS}>
                Send Test SMS
              </Button>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twilio Account SID"
              value={smsSettings.accountSid}
              onChange={(e) => setSmsSettings({ ...smsSettings, accountSid: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twilio Auth Token"
              type="password"
              value={smsSettings.authToken}
              onChange={(e) => setSmsSettings({ ...smsSettings, authToken: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Twilio Phone Number"
              value={smsSettings.phoneNumber}
              onChange={(e) => setSmsSettings({ ...smsSettings, phoneNumber: e.target.value })}
              placeholder="+1234567890"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Notification Preferences */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <NotificationsIcon color="primary" />
          <Typography variant="h6">Notification Preferences</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })
                  }
                />
              }
              label="Email Notifications"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.smsNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, smsNotifications: e.target.checked })
                  }
                />
              }
              label="SMS Notifications"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })
                  }
                />
              }
              label="Push Notifications (Mobile App)"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              Notification Recipients
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.parentNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, parentNotifications: e.target.checked })
                  }
                />
              }
              label="Parents"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.teacherNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, teacherNotifications: e.target.checked })
                  }
                />
              }
              label="Teachers"
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={notificationSettings.adminNotifications}
                  onChange={(e) =>
                    setNotificationSettings({ ...notificationSettings, adminNotifications: e.target.checked })
                  }
                />
              }
              label="Administrators"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Security Settings */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <SecurityIcon color="primary" />
          <Typography variant="h6">Security Settings</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={securitySettings.twoFactorAuth}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, twoFactorAuth: e.target.checked })
                  }
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>Require Two-Factor Authentication</Typography>
                  <Typography variant="caption" color="text.secondary">
                    All users must enable 2FA to access the system
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Session Timeout (minutes)"
              type="number"
              value={securitySettings.sessionTimeout}
              onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Password Expiry (days)"
              type="number"
              value={securitySettings.passwordExpiry}
              onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Min Password Length"
              type="number"
              value={securitySettings.minPasswordLength}
              onChange={(e) => setSecuritySettings({ ...securitySettings, minPasswordLength: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={securitySettings.requireSpecialChars}
                  onChange={(e) =>
                    setSecuritySettings({ ...securitySettings, requireSpecialChars: e.target.checked })
                  }
                />
              }
              label="Require Special Characters in Passwords"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Backup Settings */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <StorageIcon color="primary" />
          <Typography variant="h6">Backup & Data Management</Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={backupSettings.autoBackup}
                  onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>Automatic Backups</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically backup system data on schedule
                  </Typography>
                </Box>
              }
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Backup Frequency</InputLabel>
              <Select
                value={backupSettings.backupFrequency}
                label="Backup Frequency"
                onChange={(e) => setBackupSettings({ ...backupSettings, backupFrequency: e.target.value })}
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Backup Time"
              type="time"
              value={backupSettings.backupTime}
              onChange={(e) => setBackupSettings({ ...backupSettings, backupTime: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Retention Period (days)"
              type="number"
              value={backupSettings.retentionDays}
              onChange={(e) => setBackupSettings({ ...backupSettings, retentionDays: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined">Download Backup</Button>
              <Button variant="outlined" color="warning">
                Restore from Backup
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Save Button */}
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" size="large">
          Cancel
        </Button>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
}
