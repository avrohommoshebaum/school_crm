import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveIcon from '@mui/icons-material/Save';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

interface TeacherAttendanceProps {
  teacherId: string;
}

// Mock classes for this teacher
const mockClasses = [
  {
    id: '2',
    className: '1st Grade A',
    students: [
      { id: 's1', name: 'Sarah Goldstein', hebrewName: 'שרה גולדשטיין' },
      { id: 's2', name: 'Rivka Schwartz', hebrewName: 'רבקה שווארץ' },
      { id: 's3', name: 'Chaya Klein', hebrewName: 'חיה קליין' },
      { id: 's4', name: 'Leah Cohen', hebrewName: 'לאה כהן' },
      { id: 's5', name: 'Devorah Levy', hebrewName: 'דבורה לוי' },
      { id: 's6', name: 'Miriam Stein', hebrewName: 'מרים שטיין' },
      { id: 's7', name: 'Rachel Friedman', hebrewName: 'רחל פרידמן' },
      { id: 's8', name: 'Esther Weiss', hebrewName: 'אסתר וייס' },
    ],
  },
];

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  notes: string;
}

export default function TeacherAttendance({ teacherId }: TeacherAttendanceProps) {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes, setClasses] = useState(mockClasses);

  useEffect(() => {
    // Auto-select first class
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    // Load existing attendance for selected class and date
    if (selectedClass && selectedDate) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        // Initialize with all present by default
        const currentClass = classes.find(c => c.id === selectedClass);
        if (currentClass) {
          const initialAttendance: Record<string, AttendanceRecord> = {};
          currentClass.students.forEach(student => {
            initialAttendance[student.id] = {
              studentId: student.id,
              status: 'present',
              notes: '',
            };
          });
          setAttendance(initialAttendance);
        }
        setLoading(false);
      }, 500);
    }
  }, [selectedClass, selectedDate, classes]);

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setSaved(false);
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes,
      },
    }));
    setSaved(false);
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call to save attendance
    setTimeout(() => {
      console.log('Saving attendance:', {
        classId: selectedClass,
        date: selectedDate,
        attendance: Object.values(attendance),
      });
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return 'success';
      case 'absent':
        return 'error';
      case 'late':
        return 'warning';
      case 'excused':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon />;
      case 'absent':
        return <CancelIcon />;
      case 'late':
        return <AccessTimeIcon />;
      case 'excused':
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  const currentClass = classes.find(c => c.id === selectedClass);
  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length;
  const lateCount = Object.values(attendance).filter(a => a.status === 'late').length;
  const excusedCount = Object.values(attendance).filter(a => a.status === 'excused').length;

  return (
    <Box>
      {/* Controls */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                label="Select Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading || !selectedClass}
              sx={{ height: 56 }}
            >
              Save Attendance
            </Button>
          </Grid>
        </Grid>

        {/* Summary Stats */}
        {currentClass && (
          <Stack direction="row" spacing={2} sx={{ mt: 3 }} flexWrap="wrap">
            <Chip
              icon={<CheckCircleIcon />}
              label={`Present: ${presentCount}`}
              color="success"
              variant="outlined"
            />
            <Chip
              icon={<CancelIcon />}
              label={`Absent: ${absentCount}`}
              color="error"
              variant="outlined"
            />
            <Chip
              icon={<AccessTimeIcon />}
              label={`Late: ${lateCount}`}
              color="warning"
              variant="outlined"
            />
            <Chip
              icon={<CheckCircleIcon />}
              label={`Excused: ${excusedCount}`}
              color="info"
              variant="outlined"
            />
          </Stack>
        )}

        {saved && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Attendance saved successfully!
          </Alert>
        )}
      </Paper>

      {/* Attendance Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : currentClass ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Hebrew Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentClass.students.map((student) => (
                <TableRow key={student.id} hover>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.hebrewName}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <IconButton
                        size="small"
                        color={attendance[student.id]?.status === 'present' ? 'success' : 'default'}
                        onClick={() => handleStatusChange(student.id, 'present')}
                        sx={{
                          bgcolor: attendance[student.id]?.status === 'present' ? 'success.50' : 'transparent',
                        }}
                      >
                        <CheckCircleIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={attendance[student.id]?.status === 'late' ? 'warning' : 'default'}
                        onClick={() => handleStatusChange(student.id, 'late')}
                        sx={{
                          bgcolor: attendance[student.id]?.status === 'late' ? 'warning.50' : 'transparent',
                        }}
                      >
                        <AccessTimeIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color={attendance[student.id]?.status === 'absent' ? 'error' : 'default'}
                        onClick={() => handleStatusChange(student.id, 'absent')}
                        sx={{
                          bgcolor: attendance[student.id]?.status === 'absent' ? 'error.50' : 'transparent',
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Add notes..."
                      value={attendance[student.id]?.notes || ''}
                      onChange={(e) => handleNotesChange(student.id, e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Select a class to view attendance
          </Typography>
        </Paper>
      )}
    </Box>
  );
}

// Missing Grid import - add this
import Grid from '@mui/material/Grid';
