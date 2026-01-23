import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import SamplePageOverlay from "../../components/samplePageOverlay";

export default function AcademicYearSettings() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [addTermDialog, setAddTermDialog] = useState(false);

  const [academicYear, setAcademicYear] = useState({
    currentYear: "2024-2025",
    startDate: "2024-09-03",
    endDate: "2025-06-20",
    totalDays: "180",
  });

  const [terms] = useState([
    { name: "First Term", startDate: "2024-09-03", endDate: "2024-12-20", status: "active" },
    { name: "Winter Break", startDate: "2024-12-21", endDate: "2025-01-05", status: "break" },
    { name: "Second Term", startDate: "2025-01-06", endDate: "2025-03-28", status: "upcoming" },
    { name: "Spring Break", startDate: "2025-03-29", endDate: "2025-04-06", status: "upcoming" },
    { name: "Third Term", startDate: "2025-04-07", endDate: "2025-06-20", status: "upcoming" },
  ]);

  const [holidays] = useState([
    { name: "Rosh Hashanah", date: "2024-10-03", type: "jewish" },
    { name: "Yom Kippur", date: "2024-10-12", type: "jewish" },
    { name: "Sukkot", date: "2024-10-17", type: "jewish" },
    { name: "Thanksgiving", date: "2024-11-28", type: "secular" },
    { name: "Chanukah", date: "2024-12-26", type: "jewish" },
    { name: "Purim", date: "2025-03-14", type: "jewish" },
    { name: "Pesach", date: "2025-04-13", type: "jewish" },
    { name: "Shavuot", date: "2025-06-02", type: "jewish" },
  ]);

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
          <Typography variant="h6">Academic Year Settings</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure academic year, terms, and holidays
          </Typography>
        </Box>

        {/* Academic Year */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ md: "center" }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h6">Current Academic Year</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure the current school year
              </Typography>
            </Box>
            <Chip label={academicYear.currentYear} color="primary" />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Academic Year"
              value={academicYear.currentYear}
              fullWidth
            />
            <TextField
              label="Start Date"
              type="date"
              value={academicYear.startDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={academicYear.endDate}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Total School Days"
              value={academicYear.totalDays}
              type="number"
              fullWidth
            />
          </Stack>
        </Paper>

        {/* Terms */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Terms & Semesters</Typography>
            <Button startIcon={<AddIcon />} variant="outlined">
              Add Term
            </Button>
          </Stack>

          <Stack direction="row" flexWrap="wrap" gap={2}>
            {terms.map((term, i) => (
              <Card
                key={i}
                sx={{
                  width: 320,
                  border:
                    term.status === "active"
                      ? "2px solid #1976d2"
                      : "2px solid #e0e0e0",
                  bgcolor: term.status === "break" ? "#fff3e0" : "white",
                }}
              >
                <CardContent>
                  <Typography fontWeight="bold">{term.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(term.startDate).toLocaleDateString()} –{" "}
                    {new Date(term.endDate).toLocaleDateString()}
                  </Typography>

                  <Stack direction="row" justifyContent="space-between" mt={2}>
                    <Chip
                      size="small"
                      label={
                        term.status === "active"
                          ? "Active"
                          : term.status === "break"
                          ? "Break"
                          : "Upcoming"
                      }
                    />
                    <Stack direction="row">
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Paper>

        {/* Holidays */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" mb={3}>
            Holidays & School Closures
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            {["jewish", "secular"].map(type => (
              <Box key={type} sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  color={type === "jewish" ? "primary" : "secondary"}
                  mb={2}
                >
                  {type === "jewish" ? "Jewish Holidays" : "Secular Holidays"}
                </Typography>

                <List sx={{ bgcolor: "#f5f5f5", borderRadius: 2 }}>
                  {holidays
                    .filter(h => h.type === type)
                    .map((holiday, i, arr) => (
                      <Box key={i}>
                        <ListItem
                          secondaryAction={
                            <IconButton size="small" color="error">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          }
                        >
                          <CalendarMonthIcon sx={{ mr: 2 }} />
                          <ListItemText
                            primary={holiday.name}
                            secondary={new Date(holiday.date).toLocaleDateString()}
                          />
                        </ListItem>
                        {i < arr.length - 1 && <Divider />}
                      </Box>
                    ))}
                </List>
              </Box>
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

      {/* Add Term Dialog */}
      <Dialog open={addTermDialog} onClose={() => setAddTermDialog(false)}>
        <DialogTitle>Add New Term</DialogTitle>
        <DialogContent>
          <Stack spacing={3} mt={2}>
            <TextField label="Term Name" fullWidth />
            <TextField type="date" label="Start Date" InputLabelProps={{ shrink: true }} fullWidth />
            <TextField type="date" label="End Date" InputLabelProps={{ shrink: true }} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddTermDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Term</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

