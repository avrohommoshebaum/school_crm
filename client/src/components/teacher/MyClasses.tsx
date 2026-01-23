import { useState, useEffect } from 'react';
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
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import RoomIcon from '@mui/icons-material/Room';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import SamplePageOverlay from '../../components/samplePageOverlay';

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

/* ---------------- Mock Data ---------------- */

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
    ],
  },
];

/* ---------------- Component ---------------- */

export default function MyClasses({ teacherId }: MyClassesProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    setTimeout(() => {
      if (!mounted) return;
      setClasses(mockClasses.filter(c => c.teacherId === teacherId));
      setLoading(false);
    }, 500);

    return () => {
      mounted = false;
    };
  }, [teacherId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!classes.length) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary">
          No classes assigned
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <SamplePageOverlay />

      <Stack spacing={3}>
        {classes.map(classItem => {
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
            <Card
              key={classItem.id}
              sx={{
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
                {/* Header */}
                <Stack direction="row" justifyContent="space-between" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
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
                </Stack>

                {/* Details */}
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RoomIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">Room {classItem.room}</Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <PeopleIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">
                      {classItem.studentCount} / {classItem.maxCapacity} students
                    </Typography>
                    <Chip
                      label={`${Math.round(capacityPercentage)}%`}
                      color={capacityColor}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <ScheduleIcon fontSize="small" color="disabled" />
                    <Typography variant="body2">
                      {classItem.schedule}
                    </Typography>
                  </Stack>
                </Stack>

                {/* Subjects */}
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary" mb={1} display="block">
                    Subjects
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {classItem.subjects.slice(0, 3).map(subject => (
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

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Stack direction="row" spacing={1} width="100%">
                  <Button
                    fullWidth
                    size="small"
                    variant="outlined"
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      navigate(`/teacher/classes/${classItem.id}/attendance`, {
                        state: { classId: classItem.id },
                      })
                    }
                  >
                    Attendance
                  </Button>
                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    startIcon={<AssignmentIcon />}
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
          );
        })}
      </Stack>
    </>
  );
}

