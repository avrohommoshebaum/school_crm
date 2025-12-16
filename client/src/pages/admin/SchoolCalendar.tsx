import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import SchoolIcon from "@mui/icons-material/School";
import BeachAccessIcon from "@mui/icons-material/BeachAccess";
import CelebrationIcon from "@mui/icons-material/Celebration";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import ViewDayIcon from "@mui/icons-material/ViewDay";

import SamplePageOverlay from "../../components/samplePageOverlay";

interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  endDate?: string;
  type: "holiday" | "break" | "event" | "meeting" | "special";
  description?: string;
  allDay: boolean;
  time?: string;
}

export default function SchoolCalendar() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string>("all");

  /* ---------- SAMPLE DATA ---------- */

  const events: CalendarEvent[] = [
    { id: 1, title: "Rosh Hashanah", date: "2024-10-03", endDate: "2024-10-04", type: "holiday", allDay: true },
    { id: 2, title: "Yom Kippur", date: "2024-10-12", type: "holiday", allDay: true },
    { id: 3, title: "Sukkot", date: "2024-10-17", endDate: "2024-10-24", type: "holiday", allDay: true },
    { id: 4, title: "Winter Break", date: "2024-12-23", endDate: "2025-01-03", type: "break", allDay: true },
  ];

  const eventTypeConfig = {
    holiday: { color: "#7b1fa2", icon: CelebrationIcon, label: "Holiday" },
    break: { color: "#f57c00", icon: BeachAccessIcon, label: "Break" },
    event: { color: "#1976d2", icon: EventIcon, label: "Event" },
    meeting: { color: "#388e3c", icon: MeetingRoomIcon, label: "Meeting" },
    special: { color: "#d32f2f", icon: SchoolIcon, label: "Special" },
  };

  /* ---------- DATE HELPERS ---------- */

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    return { year, month, firstDay, days };
  };

  const getEventsForDate = (date: Date) => {
    const d = date.toISOString().split("T")[0];
    return events.filter(e =>
      e.endDate ? d >= e.date && d <= e.endDate : e.date === d
    );
  };

  const { year, month, firstDay, days } = getDaysInMonth(currentDate);

  /* ---------- UI ---------- */

  return (
    <Box sx={{ position: "relative" }}>
      {/* SAMPLE OVERLAY */}
      <SamplePageOverlay text="Sample Page" />

      {/* Disable interaction */}
      <Box sx={{ pointerEvents: "none", opacity: 0.9 }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Stack direction="row" justifyContent="flex-end" mb={3}>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Event
          </Button>
        </Stack>

        {/* MAIN LAYOUT */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* CALENDAR */}
          <Paper sx={{ p: 3, flex: 1 }}>
            {/* Controls */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton>
                  <ChevronLeftIcon />
                </IconButton>
                <Typography variant="h6">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Typography>
                <IconButton>
                  <ChevronRightIcon />
                </IconButton>
              </Stack>

              <ToggleButtonGroup
                value={viewMode}
                exclusive
                size="small"
                onChange={(_, v) => v && setViewMode(v)}
              >
                <ToggleButton value="month">
                  <ViewModuleIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="week">
                  <ViewWeekIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="day">
                  <ViewDayIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* MONTH VIEW */}
            {viewMode === "month" && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  border: "1px solid #e0e0e0",
                }}
              >
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <Box key={d} sx={{ p: 1, bgcolor: "#f5f5f5", textAlign: "center" }}>
                    <Typography variant="caption" fontWeight="bold">
                      {d}
                    </Typography>
                  </Box>
                ))}

                {Array.from({ length: firstDay }).map((_, i) => (
                  <Box key={`empty-${i}`} sx={{ minHeight: 100 }} />
                ))}

                {Array.from({ length: days }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const dayEvents = getEventsForDate(date);

                  return (
                    <Box
                      key={day}
                      sx={{
                        minHeight: 100,
                        borderTop: "1px solid #e0e0e0",
                        borderLeft: "1px solid #e0e0e0",
                        p: 1,
                      }}
                    >
                      <Typography variant="body2">{day}</Typography>
                      <Stack spacing={0.5} mt={0.5}>
                        {dayEvents.slice(0, 2).map(e => (
                          <Chip
                            key={e.id}
                            size="small"
                            label={e.title}
                            sx={{
                              bgcolor: eventTypeConfig[e.type].color,
                              color: "white",
                              fontSize: "0.65rem",
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Paper>

          {/* SIDEBAR */}
          <Paper sx={{ p: 3, width: { lg: 300 } }}>
            <Typography variant="h6" mb={2}>
              Upcoming Events
            </Typography>
            <List disablePadding>
              {events.slice(0, 4).map(e => {
                const Icon = eventTypeConfig[e.type].icon;
                return (
                  <ListItem key={e.id} disableGutters>
                    <Icon sx={{ color: eventTypeConfig[e.type].color, mr: 2 }} />
                    <ListItemText primary={e.title} />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
