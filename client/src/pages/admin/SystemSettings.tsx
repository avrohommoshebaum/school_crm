import { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
  Divider,
  useTheme,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import SettingsIcon from "@mui/icons-material/Settings";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";

import api from "../../utils/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function SystemSettings() {
  const theme = useTheme();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [securitySettings, setSecuritySettings] = useState({
    require2FA: false,
  });

  // Track original settings to detect changes
  const originalSettingsRef = useRef<{ require2FA: boolean } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/system-settings");
      const settings = res.data.settings || {};
      
      const loadedSettings = {
        require2FA: settings.require_2fa?.value === true || settings.require_2fa?.value === "true",
      };

      setSecuritySettings(loadedSettings);
      originalSettingsRef.current = { ...loadedSettings };
    } catch (error: any) {
      console.error("Error loading settings:", error);
      showSnackbar("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (!originalSettingsRef.current) return false;
    return (
      securitySettings.require2FA !== originalSettingsRef.current.require2FA
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      await api.put("/system-settings", {
        key: "require_2fa",
        value: securitySettings.require2FA,
        description: "Require 2FA for all users",
      });

      // Update original settings after successful save
      originalSettingsRef.current = { ...securitySettings };
      showSnackbar("Settings saved successfully", "success");
    } catch (error: any) {
      console.error("Error saving settings:", error);
      showSnackbar(error?.response?.data?.message || "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (originalSettingsRef.current) {
      setSecuritySettings({ ...originalSettingsRef.current });
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") =>
    setSnackbar({ open: true, message, severity });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  const isEditing = hasChanges();

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          fontWeight={400}
          sx={{ 
            fontSize: { xs: "1.75rem", sm: "2rem" },
            mb: 0.5,
            color: theme.palette.text.primary,
          }}
        >
          System Settings
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          Configure system-wide settings and security policies
        </Typography>
      </Box>

      {/* Save Bar - Google style fixed bottom bar */}
      {isEditing && (
        <Paper
          elevation={3}
          sx={{
            position: "sticky",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            p: 2,
            bgcolor: theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`,
            mb: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={2}
            sx={{ maxWidth: 1200, mx: "auto" }}
          >
            <Button 
              variant="text" 
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                textTransform: "none",
                px: 3,
                fontWeight: 500,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Tabs - Google style */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
            "& .MuiTab-root": {
              textTransform: "none",
              minHeight: 48,
              fontSize: "0.875rem",
              fontWeight: 500,
              color: theme.palette.text.secondary,
              "&.Mui-selected": {
                color: theme.palette.primary.main,
                fontWeight: 500,
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          <Tab
            icon={<SettingsIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="General"
            sx={{ gap: 1 }}
          />
          <Tab
            icon={<SecurityIcon sx={{ fontSize: 20 }} />}
            iconPosition="start"
            label="Security"
            sx={{ gap: 1 }}
          />
        </Tabs>
      </Box>

      {/* General Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ maxWidth: 800 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <InfoIcon sx={{ color: theme.palette.info.main, mt: 0.5 }} />
              <Box>
                <Typography variant="body1" fontWeight={400}>
                  General settings will be added here as needed.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ maxWidth: 800 }}>
          {/* 2FA Section */}
          <Paper
            variant="outlined"
            sx={{
              bgcolor: theme.palette.background.paper,
              mb: 3,
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  mb: 3,
                  color: theme.palette.text.primary,
                }}
              >
                Two-Factor Authentication
              </Typography>

              {/* Setting Row - Google style */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 3,
                  pb: 3,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 400,
                      mb: 0.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Require 2FA for all users
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.8125rem",
                      color: theme.palette.text.secondary,
                      lineHeight: 1.5,
                    }}
                  >
                    When enabled, all users must set up two-factor authentication before accessing their account.
                    Users who haven't enrolled will be prompted to set up 2FA on their next login.
                  </Typography>
                </Box>
                <Switch
                  checked={securitySettings.require2FA}
                  onChange={(e) =>
                    setSecuritySettings({
                      ...securitySettings,
                      require2FA: e.target.checked,
                    })
                  }
                  sx={{
                    flexShrink: 0,
                  }}
                />
              </Box>

              {securitySettings.require2FA && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Alert
                    severity="warning"
                    icon={<InfoIcon />}
                    sx={{
                      bgcolor: theme.palette.warning.light + "15",
                      border: `1px solid ${theme.palette.warning.main}30`,
                      "& .MuiAlert-icon": {
                        color: theme.palette.warning.main,
                      },
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ mb: 1, color: theme.palette.warning.dark }}
                    >
                      Important
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, "& li": { mb: 0.5 } }}>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ fontSize: "0.8125rem", color: theme.palette.text.secondary }}
                      >
                        Users without 2FA will be locked out until they enroll
                      </Typography>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ fontSize: "0.8125rem", color: theme.palette.text.secondary }}
                      >
                        Administrators can provide one-time backup codes for users who need temporary access
                      </Typography>
                      <Typography
                        component="li"
                        variant="body2"
                        sx={{ fontSize: "0.8125rem", color: theme.palette.text.secondary }}
                      >
                        Users who login with backup codes will be required to set up 2FA immediately after
                      </Typography>
                    </Box>
                  </Alert>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </TabPanel>
    </Box>
  );
}

