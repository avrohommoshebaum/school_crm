import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import RoomIcon from "@mui/icons-material/Room";
import ScheduleIcon from "@mui/icons-material/Schedule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router";


import SamplePageOverlay from "../../components/samplePageOverlay";
/* ---------------- Mock Auth ---------------- */

const currentTeacher = {
  id: "t2",
  name: "Mrs. Rachel Cohen",
  email: "rcohen@nby.edu",
};

/* ---------------- Mock Data ---------------- */

type ClassItem = {
  id: string;
  className: string;
  grade: string;
  teacher: string;
  teacherId: string;
  room: string;
  studentCount: number;
  maxCapacity: number;
  schedule: string;
  subjects: string[];
  status: string;
  schoolYear: string;
};

const mockClasses: ClassItem[] = [
  {
    id: "2",
    className: "1st Grade A",
    grade: "1",
    teacher: "Mrs. Rachel Cohen",
    teacherId: "t2",
    room: "102",
    studentCount: 22,
    maxCapacity: 22,
    schedule: "Mon–Fri 8:15 AM – 3:15 PM",
    subjects: ["Hebrew", "English", "Math", "Science", "Judaics"],
    status: "active",
    schoolYear: "2024–2025",
  },
];

/* ---------------- Component ---------------- */

export default function MyClasses() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);

    setTimeout(() => {
      const teacherClasses = mockClasses.filter(
        (c) => c.teacherId === currentTeacher.id
      );
      setClasses(teacherClasses);
      setLoading(false);
    }, 500);

    const timer = setTimeout(() => setWelcomeOpen(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  /* ---------------- Loading ---------------- */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* ---------------- Empty ---------------- */

  if (classes.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No classes assigned
        </Typography>
      </Box>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <Box>
      {/* Overlay */}
      <SamplePageOverlay />
      {/* Welcome Snackbar */}
      <Snackbar
        open={welcomeOpen}
        autoHideDuration={3000}
        onClose={() => setWelcomeOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setWelcomeOpen(false)}
          severity="success"
          variant="filled"
        >
          Welcome back, {currentTeacher.name}! 👋
        </Alert>
      </Snackbar>

      {/* Classes */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        flexWrap="wrap"
      >
        {classes.map((classItem) => {
          const capacityPercentage =
            (classItem.studentCount / classItem.maxCapacity) * 100;

          const capacityColor =
            capacityPercentage >= 100
              ? "error"
              : capacityPercentage >= 80
              ? "warning"
              : "success";

          return (
            <Card
              key={classItem.id}
              sx={{
                width: { xs: "100%", md: "calc(50% - 12px)", lg: "calc(33.33% - 16px)" },
                display: "flex",
                flexDirection: "column",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Header */}
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      {classItem.className}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Grade {classItem.grade}
                    </Typography>
                  </Box>

                  <Chip
                    label={classItem.status}
                    color={classItem.status === "active" ? "success" : "default"}
                    size="small"
                  />
                </Stack>

                {/* Details */}
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RoomIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Room {classItem.room}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {classItem.studentCount} / {classItem.maxCapacity} students
                    </Typography>
                    <Chip
                      label={`${Math.round(capacityPercentage)}%`}
                      size="small"
                      color={capacityColor}
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      {classItem.schedule}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Subjects */}
                <Box mt={2}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    mb={1}
                    display="block"
                  >
                    Subjects
                  </Typography>

                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {classItem.subjects.slice(0, 3).map((subject) => (
                      <Chip
                        key={subject}
                        label={subject}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {classItem.subjects.length > 3 && (
                      <Chip
                        label={`+${classItem.subjects.length - 3}`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>
                </Box>
              </CardContent>

              {/* Actions */}
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1} width="100%">
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      navigate("/teacher-center/attendance")
                    }
                  >
                    Attendance
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    fullWidth
                    startIcon={<AssignmentIcon />}
                    onClick={() =>
                      navigate("/teacher-center/report-cards")
                    }
                  >
                    Report Cards
                  </Button>
                </Stack>
              </CardActions>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
