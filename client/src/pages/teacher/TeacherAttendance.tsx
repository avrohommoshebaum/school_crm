import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
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
  Grid,
  Typography,
  ButtonGroup,
  Checkbox,
  Snackbar,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SaveIcon from '@mui/icons-material/Save';

// Mock logged-in teacher
const currentTeacher = {
  id: 't2',
  name: 'Mrs. Rachel Cohen',
};

// Mock classes
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
      { id: 's9', name: 'Malka Rosenberg', hebrewName: 'מלכה רוזנברג' },
      { id: 's10', name: 'Bracha Katz', hebrewName: 'ברכה כץ' },
    ],
  },
];

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  notes: string;
}

export default function TeacherAttendance() {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes, setClasses] = useState(mockClasses);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      setLoading(true);
      setTimeout(() => {
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
      }, 300);
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

  // Bulk actions
  const handleSelectAll = () => {
    const currentClass = classes.find(c => c.id === selectedClass);
    if (currentClass) {
      setSelectedStudents(new Set(currentClass.students.map(s => s.id)));
    }
  };

  const handleDeselectAll = () => {
    setSelectedStudents(new Set());
  };

  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudents(newSelected);
  };

  const handleBulkStatusChange = (status: AttendanceStatus) => {
    const updates = { ...attendance };
    selectedStudents.forEach(studentId => {
      updates[studentId] = {
        ...updates[studentId],
        status,
      };
    });
    setAttendance(updates);
    setSelectedStudents(new Set());
    setSaved(false);
  };

  const handleMarkAllPresent = () => {
    const updates = { ...attendance };
    Object.keys(updates).forEach(studentId => {
      updates[studentId].status = 'present';
    });
    setAttendance(updates);
    setSaved(false);
  };

  const currentClass = classes.find(c => c.id === selectedClass);
  const presentCount = Object.values(attendance).filter(a => a.status === 'present').length;
  const absentCount = Object.values(attendance).filter(a => a.status === 'absent').length;
  const lateCount = Object.values(attendance).filter(a => a.status === 'late').length;

  return (
    <Box>
      {/* Success Snackbar */}
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Attendance saved successfully!
        </Alert>
      </Snackbar>

      {/* Header Controls */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">Take Attendance</Typography>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading || !selectedClass}
              size="large"
            >
              Save Attendance
            </Button>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
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
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="date"
                label="Date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              {currentClass && (
                <Stack direction="row" spacing={2} sx={{ height: '100%' }} alignItems="center">
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: 'success.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'success.200',
                  }}>
                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{presentCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Present</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: 'warning.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'warning.200',
                  }}>
                    <AccessTimeIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{lateCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Late</Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    px: 2,
                    py: 1,
                    bgcolor: 'error.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'error.200',
                  }}>
                    <CancelIcon sx={{ color: 'error.main', fontSize: 20 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{absentCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Absent</Typography>
                  </Box>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Quick Actions Bar */}
        <Box sx={{ px: 3, py: 2, bgcolor: '#fafafa' }}>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
              Quick Actions:
            </Typography>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={handleMarkAllPresent}
            >
              Mark All Present
            </Button>
            
            {selectedStudents.size > 0 && (
              <>
                <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
                <Chip
                  label={`${selectedStudents.size} student${selectedStudents.size > 1 ? 's' : ''} selected`}
                  color="primary"
                  onDelete={handleDeselectAll}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  Set to:
                </Typography>
                <ButtonGroup size="small">
                  <Button
                    onClick={() => handleBulkStatusChange('present')}
                    variant="outlined"
                    color="success"
                  >
                    Present
                  </Button>
                  <Button
                    onClick={() => handleBulkStatusChange('late')}
                    variant="outlined"
                    color="warning"
                  >
                    Late
                  </Button>
                  <Button
                    onClick={() => handleBulkStatusChange('absent')}
                    variant="outlined"
                    color="error"
                  >
                    Absent
                  </Button>
                </ButtonGroup>
              </>
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Attendance Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : currentClass ? (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1976d2' }}>
                <TableCell padding="checkbox" sx={{ borderBottom: 'none' }}>
                  <Checkbox
                    checked={selectedStudents.size === currentClass.students.length}
                    indeterminate={selectedStudents.size > 0 && selectedStudents.size < currentClass.students.length}
                    onChange={(e) => e.target.checked ? handleSelectAll() : handleDeselectAll()}
                    sx={{ color: 'white', '&.Mui-checked': { color: 'white' }, '&.MuiCheckbox-indeterminate': { color: 'white' } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }}>Hebrew Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }}>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentClass.students.map((student, index) => {
                const isSelected = selectedStudents.has(student.id);
                const status = attendance[student.id]?.status;

                return (
                  <TableRow 
                    key={student.id} 
                    hover
                    selected={isSelected}
                    sx={{
                      bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: 'primary.100',
                      },
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleToggleStudent(student.id)}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{student.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{student.hebrewName}</TableCell>
                    <TableCell align="center">
                      <ButtonGroup variant="outlined" size="small">
                        <Button
                          onClick={() => handleStatusChange(student.id, 'present')}
                          variant={status === 'present' ? 'contained' : 'outlined'}
                          color="success"
                          sx={{ minWidth: 90 }}
                        >
                          Present
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(student.id, 'late')}
                          variant={status === 'late' ? 'contained' : 'outlined'}
                          color="warning"
                          sx={{ minWidth: 70 }}
                        >
                          Late
                        </Button>
                        <Button
                          onClick={() => handleStatusChange(student.id, 'absent')}
                          variant={status === 'absent' ? 'contained' : 'outlined'}
                          color="error"
                          sx={{ minWidth: 80 }}
                        >
                          Absent
                        </Button>
                      </ButtonGroup>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Add notes..."
                        value={attendance[student.id]?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
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
