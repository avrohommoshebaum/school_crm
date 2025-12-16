import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  TextField,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import api from "../../utils/api";
import useCurrentUser from "../../hooks/useCurrentUser";
import { SampleWrapper } from "../../components/SampleWrapper";

export default function SettingsPage() {
  const { settings, loading, reload } = useCurrentUser();

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });
  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // -------------------------------
  // DEFAULT SETTINGS
  // -------------------------------
  const defaultSettings = {
    emailNotifications: false,
    smsNotifications: false,
    pushNotifications: false,
    notifyStudentAbsence: false,
    notifyNewApplication: false,
    notifyParentMessage: false,
    notifyReportCardDue: false,
    theme: "light",
    language: "en",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
  };

  const [form, setForm] = useState(defaultSettings);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // -------------------------------
  // PASSWORD
  // -------------------------------
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changing, setChanging] = useState(false);

  const updatePasswordField = (key: string, value: string) =>
    setPasswordForm((prev) => ({ ...prev, [key]: value }));

  // Load settings
  useEffect(() => {
    if (settings) {
      setForm({ ...defaultSettings, ...settings });
    }
  }, [settings]);

  if (loading) return null;

  const update = (key: string, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // -------------------------------
  // SAVE SETTINGS
  // -------------------------------
  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put("/profile/me/settings", form);
      showSnackbar("Settings updated successfully", "success");
      setEdit(false);
      reload();
    } catch (err: any) {
      showSnackbar(err.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setForm({ ...defaultSettings, ...settings });
    setEdit(false);
  };

  // -------------------------------
  // CHANGE PASSWORD
  // -------------------------------
  const changePassword = async () => {
    console.log("🔐 Updating password...");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      return showSnackbar("Please fill out all password fields", "error");
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showSnackbar("New passwords do not match", "error");
    }

    try {
      setChanging(true);

      const res = await api.put("/profile/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      showSnackbar(res.data.message || "Password updated successfully", "success");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      showSnackbar(
        err.response?.data?.message || "Error updating password",
        "error"
      );
    } finally {
      setChanging(false);
    }
  };

  const notificationKeys = [
    "emailNotifications",
    "smsNotifications",
    "pushNotifications",
    "notifyStudentAbsence",
    "notifyNewApplication",
    "notifyParentMessage",
    "notifyReportCardDue",
  ];

  const readable = (text: string) =>
    text.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* HEADER */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Settings
        </Typography>

        {!edit ? (
          <Button variant="contained" onClick={() => setEdit(true)}>
            Edit
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button onClick={cancel}>Cancel</Button>
            <Button variant="contained" onClick={saveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </Stack>
        )}
      </Stack>

      {/* NOTIFICATIONS */}
      <SampleWrapper label="Sample">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Notifications
        </Typography>

        <Stack spacing={1.5}>
          {notificationKeys.map((key) =>
            edit ? (
              <FormControlLabel
                key={key}
                control={
                  <Switch
                    size="small"
                    checked={!!form[key as keyof typeof form]}
                    onChange={(e) => update(key, e.target.checked)}
                  />
                }
                label={readable(key)}
              />
            ) : (
              <RowDisplay key={key} label={readable(key)} value={form[key as keyof typeof form] ? "On" : "Off"} />
            )
          )}
        </Stack>
      </Paper>
      </SampleWrapper>

      {/* DISPLAY SETTINGS */}
      <SampleWrapper label="Sample">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Display Settings
        </Typography>

        <Stack spacing={2}>
          {!edit ? (
            <RowDisplay label="Theme" value={form.theme} />
          ) : (
            <SelectField
              label="Theme"
              value={form.theme}
              onChange={(v) => update("theme", v)}
              options={[
                { value: "light", label: "Light" },
                { value: "dark", label: "Dark" },
                { value: "auto", label: "Auto" },
              ]}
            />
          )}

          {!edit ? (
            <RowDisplay label="Language" value={form.language} />
          ) : (
            <SelectField
              label="Language"
              value={form.language}
              onChange={(v) => update("language", v)}
              options={[
                { value: "en", label: "English" },
                { value: "he", label: "Hebrew" },
                { value: "yi", label: "Yiddish" },
              ]}
            />
          )}

          {!edit ? (
            <RowDisplay label="Date Format" value={form.dateFormat} />
          ) : (
            <SelectField
              label="Date Format"
              value={form.dateFormat}
              onChange={(v) => update("dateFormat", v)}
              options={[
                { value: "MM/DD/YYYY", label: "MM/DD/YYYY" },
                { value: "DD/MM/YYYY", label: "DD/MM/YYYY" },
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
              ]}
            />
          )}

          {!edit ? (
            <RowDisplay label="Time Format" value={form.timeFormat} />
          ) : (
            <SelectField
              label="Time Format"
              value={form.timeFormat}
              onChange={(v) => update("timeFormat", v)}
              options={[
                { value: "12h", label: "12 Hour" },
                { value: "24h", label: "24 Hour" },
              ]}
            />
          )}
        </Stack>
      </Paper>
</SampleWrapper>
      {/* CHANGE PASSWORD */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Change Password
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2} sx={{ maxWidth: 400 }}>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            value={passwordForm.currentPassword}
            onChange={(e) => updatePasswordField("currentPassword", e.target.value)}
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={passwordForm.newPassword}
            onChange={(e) => updatePasswordField("newPassword", e.target.value)}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={passwordForm.confirmPassword}
            onChange={(e) => updatePasswordField("confirmPassword", e.target.value)}
          />

          <Button variant="contained" disabled={changing} onClick={changePassword}>
            {changing ? "Updating..." : "Update Password"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}

/* --------------------------
   SMALL COMPONENTS
--------------------------- */

function RowDisplay({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography>{label}</Typography>
      <Typography color="text.secondary">{value}</Typography>
    </Stack>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
