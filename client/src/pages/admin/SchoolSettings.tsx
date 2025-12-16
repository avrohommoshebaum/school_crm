import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import SchoolIcon from "@mui/icons-material/School";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PublicIcon from "@mui/icons-material/Public";
import PaletteIcon from "@mui/icons-material/Palette";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

import SamplePageOverlay from "../../components/samplePageOverlay";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

export default function SchoolSettings() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [schoolInfo] = useState({
    name: "Nachlas Bais Yaakov",
    hebrewName: "נחלת בית יעקב",
    address: "213 Newport Ave",
    phone: "(732) 994-3935",
    principalName: "Mrs. Smith",
    timezone: "America/New_York",
  });

  const [branding] = useState({
    primaryColor: "#1976d2",
    secondaryColor: "#388e3c",
    accentColor: "#f57c00",
  });

  return (
    <Box sx={{ position: "relative" }}>
      {/* SAMPLE OVERLAY */}
      <SamplePageOverlay text="Sample Page" />

      {/* Disabled content */}
      <Box sx={{ pointerEvents: "none", opacity: 0.85 }}>
        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            background: "linear-gradient(135deg, #1976d2, #1565c0)",
            color: "white",
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            School Settings
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Manage your school's information, branding, and configuration
          </Typography>
        </Paper>

        {/* MAIN LAYOUT */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* LEFT – BRANDING */}
          <Box sx={{ flex: { lg: "0 0 360px" } }}>
            <Card elevation={3}>
              <CardContent>
                <SectionHeader
                  icon={<PaletteIcon />}
                  title="Logo & Branding"
                  subtitle="Visual identity"
                  color="#1976d2"
                />

                <Divider sx={{ my: 2 }} />

                <Stack alignItems="center" spacing={2}>
                  <Avatar sx={{ width: 140, height: 140 }} />
                  <IconButton>
                    <PhotoCameraIcon />
                  </IconButton>
                </Stack>

                <ColorField label="Primary" value={branding.primaryColor} />
                <ColorField label="Secondary" value={branding.secondaryColor} />
                <ColorField label="Accent" value={branding.accentColor} />

                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  sx={{ mt: 2 }}
                >
                  Reset to Default
                </Button>
              </CardContent>
            </Card>
          </Box>

          {/* RIGHT – INFO */}
          <Stack spacing={3} sx={{ flex: 1 }}>
            <InfoCard icon={<SchoolIcon />} title="School Information" color="#388e3c">
              <Stack spacing={2}>
                <TextField fullWidth label="School Name" value={schoolInfo.name} />
                <TextField
                  fullWidth
                  label="School Name (Hebrew)"
                  value={schoolInfo.hebrewName}
                  inputProps={{ dir: "rtl" }}
                />
              </Stack>
            </InfoCard>

            <InfoCard icon={<LocationOnIcon />} title="Address" color="#f57c00">
              <TextField fullWidth label="Street Address" value={schoolInfo.address} />
            </InfoCard>

            <InfoCard icon={<ContactPhoneIcon />} title="Contact" color="#7b1fa2">
              <TextField fullWidth label="Phone" value={schoolInfo.phone} />
            </InfoCard>

            <InfoCard
              icon={<AdminPanelSettingsIcon />}
              title="Administration"
              color="#d32f2f"
            >
              <TextField
                fullWidth
                label="Principal Name"
                value={schoolInfo.principalName}
              />
            </InfoCard>

            <InfoCard icon={<PublicIcon />} title="Regional" color="#0097a7">
              <FormControl fullWidth size="small">
                <InputLabel>Timezone</InputLabel>
                <Select value={schoolInfo.timezone} label="Timezone">
                  <MenuItem value="America/New_York">Eastern</MenuItem>
                </Select>
              </FormControl>
            </InfoCard>
          </Stack>
        </Box>

        {/* FOOTER */}
        <Paper
          sx={{
            mt: 3,
            p: 3,
            position: "sticky",
            bottom: 0,
            borderTop: "3px solid #1976d2",
          }}
        >
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            fullWidth={isMobile}
            onClick={() =>
              setSnackbar({
                open: true,
                message: "This is a sample page",
                severity: "error",
              })
            }
          >
            Save Changes
          </Button>
        </Paper>
      </Box>
    </Box>
  );
}

/* ---------------- Helpers ---------------- */

function SectionHeader({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  color: string;
}) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ bgcolor: color, color: "white", p: 1, borderRadius: 2 }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function InfoCard({
  icon,
  title,
  color,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <Card elevation={3}>
      <CardContent>
        <SectionHeader icon={icon} title={title} color={color} />
        <Divider sx={{ my: 2 }} />
        {children}
      </CardContent>
    </Card>
  );
}

function ColorField({ label, value }: { label: string; value: string }) {
  return (
    <TextField
      fullWidth
      size="small"
      type="color"
      label={label}
      value={value}
      sx={{ mt: 2 }}
    />
  );
}
