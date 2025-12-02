import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RoomIcon from '@mui/icons-material/Room';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router';

// Mock logged-in teacher - replace with actual auth
const currentTeacher = {
  id: 't2',
  name: 'Mrs. Rachel Cohen',
  email: 'rcohen@nby.edu',
};

// Mock data
const mockClasses = [
  {
    id: '2',
    className: '1st Grade A',
    grade: '1',
    teacher: 'Mrs. Rachel Cohen',
    teacherId: 't2',
    room: '102',
    studentCount: 22,
    maxCapacity: 22,
    schedule: 'Mon-Fri 8:15 AM - 3:15 PM',
    subjects: ['Hebrew', 'English', 'Math', 'Science', 'Judaics'],
    status: 'active',
    schoolYear: '2024-2025',
  },
];

export default function MyClasses() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate API call to fetch teacher's classes
    setLoading(true);
    setTimeout(() => {
      const teacherClasses = mockClasses.filter(c => c.teacherId === currentTeacher.id);
      setClasses(teacherClasses);
      setLoading(false);
    }, 500);

    // Auto-close welcome message after 3 seconds
    const timer = setTimeout(() => {
      setWelcomeOpen(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (classes.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          No classes assigned
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Snackbar */}
      <Snackbar
        open={welcomeOpen}
        autoHideDuration={3000}
        onClose={() => setWelcomeOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setWelcomeOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Welcome back, {currentTeacher.name}! 👋
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {classes.map((classItem) => {
          const capacityPercentage = (classItem.studentCount / classItem.maxCapacity) * 100;
          const capacityColor = capacityPercentage >= 100 ? 'error' : capacityPercentage >= 80 ? 'warning' : 'success';

          return (
            <Grid item xs={12} md={6} lg={4} key={classItem.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Class Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {classItem.className}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Grade {classItem.grade}
                      </Typography>
                    </Box>
                    <Chip
                      label={classItem.status}
                      color={classItem.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>

                  {/* Class Details */}
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RoomIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        Room {classItem.room}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PeopleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {classItem.studentCount} / {classItem.maxCapacity} students
                      </Typography>
                      <Chip
                        label={`${Math.round(capacityPercentage)}%`}
                        color={capacityColor}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ScheduleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {classItem.schedule}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Subjects */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Subjects
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {classItem.subjects.slice(0, 3).map((subject: string) => (
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
                    </Box>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Stack direction="row" spacing={1} width="100%">
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      variant="outlined"
                      fullWidth
                      onClick={() => navigate('/teacher-center/attendance')}
                    >
                      Attendance
                    </Button>
                    <Button
                      size="small"
                      startIcon={<AssignmentIcon />}
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/teacher-center/report-cards')}
                    >
                      Report Cards
                    </Button>
                  </Stack>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
