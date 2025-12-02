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
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RoomIcon from '@mui/icons-material/Room';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  hebrewName?: string;
}

type ClassStatus = 'active' | 'inactive' | 'archived';

interface Class {
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
  status: ClassStatus;
  schoolYear: string;
  students: Student[];
}

interface MyClassesProps {
  teacherId: string;
}

// Mock data - replace with actual API call
const mockClasses: Class[] = [
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
    students: [
      { id: 's1', name: 'Sarah Goldstein', hebrewName: 'שרה' },
      { id: 's2', name: 'Rivka Schwartz', hebrewName: 'רבקה' },
      { id: 's3', name: 'Chaya Klein', hebrewName: 'חיה' },
      // ... more students
    ],
  },
];

export default function MyClasses({ teacherId }: MyClassesProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchClasses = async () => {
      setLoading(true);

      // Simulate API call to fetch teacher's classes
      setTimeout(() => {
        if (!isMounted) return;
        const teacherClasses = mockClasses.filter(
          (c) => c.teacherId === teacherId
        );
        setClasses(teacherClasses);
        setLoading(false);
      }, 500);

      // In real code, you might do:
      // try {
      //   const res = await fetch(`/api/teachers/${teacherId}/classes`);
      //   const data: Class[] = await res.json();
      //   if (isMounted) setClasses(data);
      // } catch (e) {
      //   // handle error
      // } finally {
      //   if (isMounted) setLoading(false);
      // }
    };

    fetchClasses();

    return () => {
      isMounted = false;
    };
  }, [teacherId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 400,
        }}
      >
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
    <Grid container spacing={3}>
      {classes.map((classItem) => {
        const capacityPercentage =
          classItem.maxCapacity > 0
            ? (classItem.studentCount / classItem.maxCapacity) * 100
            : 0;
        const capacityColor =
          capacityPercentage >= 100
            ? 'error'
            : capacityPercentage >= 80
            ? 'warning'
            : 'success';

        return (
          <Grid item xs={12} md={6} lg={4} key={classItem.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Class Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', mb: 0.5 }}
                    >
                      {classItem.className}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Grade {classItem.grade} • {classItem.schoolYear}
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
                    <PeopleIcon
                      sx={{ fontSize: 20, color: 'text.secondary' }}
                    />
                    <Typography variant="body2">
                      {classItem.studentCount} / {classItem.maxCapacity}{' '}
                      students
                    </Typography>
                    <Chip
                      label={`${Math.round(capacityPercentage)}%`}
                      color={capacityColor}
                      size="small"
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon
                      sx={{ fontSize: 20, color: 'text.secondary' }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontSize: '0.875rem' }}
                    >
                      {classItem.schedule}
                    </Typography>
                  </Box>
                </Stack>

                {/* Subjects */}
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mb: 1 }}
                  >
                    Subjects
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
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
                    onClick={() =>
                      navigate(`/teacher/classes/${classItem.id}/attendance`, {
                        state: { classId: classItem.id },
                      })
                    }
                  >
                    Attendance
                  </Button>
                  <Button
                    size="small"
                    startIcon={<AssignmentIcon />}
                    variant="contained"
                    fullWidth
                    onClick={() =>
                      navigate(`/teacher/classes/${classItem.id}/report-cards`, {
                        state: { classId: classItem.id },
                      })
                    }
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
  );
}
