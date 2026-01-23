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
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import SamplePageOverlay from "../../components/samplePageOverlay";

export default function ApplicationSettings() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [applicationSettings, setApplicationSettings] = useState({
    acceptingApplications: true,
    applicationDeadline: "2025-03-15",
    startDate: "2025-09-01",
    requirePayment: true,
    applicationFee: "50",
    allowWaitlist: true,
    maxStudents: "500",
    minAge: "5",
    maxAge: "18",
  });

  const [requiredDocuments] = useState([
    "Birth Certificate",
    "Immunization Records",
    "Previous School Records",
    "Photo ID (Parent/Guardian)",
    "Proof of Residence",
  ]);

  const [gradeSettings, setGradeSettings] = useState([
    { grade: "Kindergarten", capacity: 40, currentEnrollment: 38, status: "open" },
    { grade: "1st Grade", capacity: 45, currentEnrollment: 45, status: "full" },
    { grade: "2nd Grade", capacity: 45, currentEnrollment: 42, status: "open" },
    { grade: "3rd Grade", capacity: 45, currentEnrollment: 39, status: "open" },
  ]);

  const toggleGradeStatus = (index: number) => {
    const updated = [...gradeSettings];
    updated[index].status = updated[index].status === "open" ? "closed" : "open";
    setGradeSettings(updated);
  };

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
          <Typography variant="h6">Application Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage student application process and enrollment
          </Typography>
        </Box>

        {/* Application Status */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography variant="h6">Application Status</Typography>
              <Typography variant="body2" color="text.secondary">
                Control whether applications are being accepted
              </Typography>
            </Box>

            <Chip
              label={
                applicationSettings.acceptingApplications
                  ? "ACCEPTING APPLICATIONS"
                  : "APPLICATIONS CLOSED"
              }
              color={applicationSettings.acceptingApplications ? "success" : "error"}
              sx={{ fontWeight: "bold" }}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <FormControlLabel
            control={
              <Switch
                checked={applicationSettings.acceptingApplications}
                color="success"
              />
            }
            label="Accept New Applications"
          />
        </Paper>

        {/* Timeline */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={3}>
            Application Timeline
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <TextField
              fullWidth
              type="date"
              label="Application Deadline"
              value={applicationSettings.applicationDeadline}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              type="date"
              label="School Year Start Date"
              value={applicationSettings.startDate}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Paper>

        {/* Requirements */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={3}>
            Application Requirements
          </Typography>

          <Stack spacing={3}>
            <FormControlLabel
              control={<Switch checked={applicationSettings.requirePayment} />}
              label="Require Application Fee"
            />

            {applicationSettings.requirePayment && (
              <TextField
                label="Application Fee ($)"
                type="number"
                value={applicationSettings.applicationFee}
              />
            )}

            <FormControlLabel
              control={<Switch checked={applicationSettings.allowWaitlist} />}
              label="Allow Waitlist"
            />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField label="Min Age" type="number" value={applicationSettings.minAge} />
              <TextField label="Max Age" type="number" value={applicationSettings.maxAge} />
              <TextField label="Max Students" type="number" value={applicationSettings.maxStudents} />
            </Stack>
          </Stack>
        </Paper>

        {/* Required Documents */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Required Documents</Typography>
            <Button startIcon={<AddIcon />} size="small" variant="outlined">
              Add Document
            </Button>
          </Stack>

          <List>
            {requiredDocuments.map((doc, i) => (
              <ListItem
                key={i}
                secondaryAction={
                  <IconButton size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={doc} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Grade Enrollment */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={3}>
            Grade-Level Enrollment
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={2}>
            {gradeSettings.map((grade, index) => (
              <Card
                key={index}
                sx={{
                  width: 260,
                  border:
                    grade.status === "full"
                      ? "2px solid #f44336"
                      : "2px solid #e0e0e0",
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">{grade.grade}</Typography>
                      <Chip
                        size="small"
                        label={grade.status}
                        color={grade.status === "open" ? "success" : "error"}
                      />
                    </Stack>

                    <Typography variant="body2">
                      {grade.currentEnrollment} / {grade.capacity}
                    </Typography>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => toggleGradeStatus(index)}
                    >
                      Toggle Status
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Actions */}
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

