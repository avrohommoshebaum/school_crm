import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
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
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SecurityIcon from "@mui/icons-material/Security";
import StorageIcon from "@mui/icons-material/Storage";

import SamplePageOverlay from "../../components/samplePageOverlay";

export default function SystemSettings() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [emailSettings, setEmailSettings] = useState({
    provider: "smtp",
    smtpHost: "smtp.gmail.com",
    smtpPort: "587",
    smtpUser: "notifications@nachlasbaisyaakov.org",
    smtpPassword: "••••••••",
    fromName: "Nachlas Bais Yaakov",
    fromEmail: "noreply@nachlasbaisyaakov.org",
  });

  const [smsSettings, setSmsSettings] = useState({
    provider: "twilio",
    accountSid: "AC••••••••••••••••••••••••••••••••",
    authToken: "••••••••••••••••••••••••••••••••",
    phoneNumber: "+17325551234",
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
    sessionTimeout: "60",
    passwordExpiry: "90",
    minPasswordLength: "8",
    requireSpecialChars: true,
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    backupTime: "02:00",
    retentionDays: "30",
  });

  return (
    <Box sx={{ position: "relative" }}>
      {/* SAMPLE OVERLAY */}
      <SamplePageOverlay text="Sample Page" />

      {/* Disable interaction */}
      <Box sx={{ pointerEvents: "none", opacity: 0.9 }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Box mb={4}>
          <Typography variant="h6">System Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure email, SMS, notifications, security, and backups
          </Typography>
        </Box>

        {/* EMAIL */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <EmailIcon color="primary" />
            <Typography variant="h6">Email Configuration</Typography>
          </Stack>

          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Email Provider</InputLabel>
                <Select
                  value={emailSettings.provider}
                  label="Email Provider"
                  onChange={e =>
                    setEmailSettings({ ...emailSettings, provider: e.target.value })
                  }
                >
                  <MenuItem value="smtp">SMTP</MenuItem>
                  <MenuItem value="sendgrid">SendGrid</MenuItem>
                  <MenuItem value="mailgun">Mailgun</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Connected" color="success" />
                <Button variant="outlined" size="small">
                  Send Test Email
                </Button>
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="SMTP Host" value={emailSettings.smtpHost} />
              <TextField fullWidth label="SMTP Port" value={emailSettings.smtpPort} />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="SMTP Username" value={emailSettings.smtpUser} />
              <TextField fullWidth label="SMTP Password" type="password" value={emailSettings.smtpPassword} />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="From Name" value={emailSettings.fromName} />
              <TextField fullWidth label="From Email" value={emailSettings.fromEmail} />
            </Stack>
          </Stack>
        </Paper>

        {/* SMS */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <SmsIcon color="primary" />
            <Typography variant="h6">SMS Configuration</Typography>
          </Stack>

          <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>SMS Provider</InputLabel>
                <Select
                  value={smsSettings.provider}
                  label="SMS Provider"
                  onChange={e =>
                    setSmsSettings({ ...smsSettings, provider: e.target.value })
                  }
                >
                  <MenuItem value="twilio">Twilio</MenuItem>
                  <MenuItem value="nexmo">Nexmo</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={2} alignItems="center">
                <Chip label="Connected" color="success" />
                <Button variant="outlined" size="small">
                  Send Test SMS
                </Button>
              </Stack>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="Account SID" value={smsSettings.accountSid} />
              <TextField fullWidth label="Auth Token" type="password" value={smsSettings.authToken} />
            </Stack>

            <TextField
              fullWidth
              label="Phone Number"
              value={smsSettings.phoneNumber}
            />
          </Stack>
        </Paper>

        {/* NOTIFICATIONS */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Notifications</Typography>
          </Stack>

          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={notificationSettings.emailNotifications} />}
              label="Email Notifications"
            />
            <FormControlLabel
              control={<Switch checked={notificationSettings.smsNotifications} />}
              label="SMS Notifications"
            />
            <FormControlLabel
              control={<Switch checked={notificationSettings.pushNotifications} />}
              label="Push Notifications"
            />

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Recipients
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
              <FormControlLabel
                control={<Switch checked={notificationSettings.parentNotifications} />}
                label="Parents"
              />
              <FormControlLabel
                control={<Switch checked={notificationSettings.teacherNotifications} />}
                label="Teachers"
              />
              <FormControlLabel
                control={<Switch checked={notificationSettings.adminNotifications} />}
                label="Administrators"
              />
            </Stack>
          </Stack>
        </Paper>

        {/* SECURITY */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">Security</Typography>
          </Stack>

          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={securitySettings.twoFactorAuth} />}
              label="Require Two-Factor Authentication"
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField fullWidth label="Session Timeout (min)" value={securitySettings.sessionTimeout} />
              <TextField fullWidth label="Password Expiry (days)" value={securitySettings.passwordExpiry} />
              <TextField fullWidth label="Min Password Length" value={securitySettings.minPasswordLength} />
            </Stack>

            <FormControlLabel
              control={<Switch checked={securitySettings.requireSpecialChars} />}
              label="Require Special Characters"
            />
          </Stack>
        </Paper>

        {/* BACKUPS */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={1} alignItems="center" mb={3}>
            <StorageIcon color="primary" />
            <Typography variant="h6">Backups</Typography>
          </Stack>

          <Stack spacing={2}>
            <FormControlLabel
              control={<Switch checked={backupSettings.autoBackup} />}
              label="Automatic Backups"
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select value={backupSettings.backupFrequency} label="Frequency">
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Backup Time"
                type="time"
                value={backupSettings.backupTime}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Retention (days)"
                value={backupSettings.retentionDays}
              />
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button variant="outlined">Download Backup</Button>
              <Button variant="outlined" color="warning">
                Restore Backup
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* ACTIONS */}
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <Button variant="outlined">Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />}>
            Save Changes
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
