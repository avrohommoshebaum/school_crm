import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import api from '../../utils/api';

interface StudentDialogProps {
  open: boolean;
  student?: any;
  onClose: () => void;
  onSave: (studentData: any) => void;
  grades?: Array<{ id: string; name: string }>;
  classes?: Array<{ id: string; name: string; gradeId?: string }>;
}

export default function StudentDialog({ 
  open, 
  student, 
  onClose, 
  onSave, 
  grades = [],
  classes = []
}: StudentDialogProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    studentId: '',
    dateOfBirth: '',
    gender: '',
    enrollmentDate: '',
    enrollmentStatus: 'active',
    gradeId: '',
    classId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || student.first_name || '',
        lastName: student.lastName || student.last_name || '',
        middleName: student.middleName || student.middle_name || '',
        studentId: student.studentId || student.student_id || '',
        dateOfBirth: student.dateOfBirth || student.date_of_birth || '',
        gender: student.gender || '',
        enrollmentDate: student.enrollmentDate || student.enrollment_date || '',
        enrollmentStatus: student.enrollmentStatus || student.enrollment_status || 'active',
        gradeId: student.gradeId || student.grade_id || '',
        classId: student.classId || student.class_id || '',
      });
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        middleName: '',
        studentId: '',
        dateOfBirth: '',
        gender: '',
        enrollmentDate: '',
        enrollmentStatus: 'active',
        gradeId: '',
        classId: '',
      });
    }
  }, [student, open]);

  // Update available classes when grade changes
  useEffect(() => {
    if (formData.gradeId) {
      const gradeClasses = classes.filter(
        (c: any) => (c.gradeId || c.grade_id) === formData.gradeId
      );
      setAvailableClasses(gradeClasses);
      
      // If current class is not in the selected grade, clear it
      if (formData.classId && !gradeClasses.some((c: any) => (c.id || c._id) === formData.classId)) {
        setFormData(prev => ({ ...prev, classId: '' }));
      }
    } else {
      setAvailableClasses([]);
      setFormData(prev => ({ ...prev, classId: '' }));
    }
  }, [formData.gradeId, classes]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSave({
        ...formData,
        id: student?.id,
      });
      setLoading(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save student');
      setLoading(false);
    }
  };

  const isValid = formData.firstName.trim() && formData.lastName.trim();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {student ? 'Edit Student' : 'Add New Student'}
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* First Name */}
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </Grid>

            {/* Last Name */}
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </Grid>

            {/* Middle Name */}
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={formData.middleName}
                onChange={(e) => handleChange('middleName', e.target.value)}
              />
            </Grid>

            {/* Student ID */}
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Student ID"
                value={formData.studentId}
                onChange={(e) => handleChange('studentId', e.target.value)}
              />
            </Grid>

            {/* Date of Birth */}
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Gender */}
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  label="Gender"
                  onChange={(e) => handleChange('gender', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Grade */}
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Grade</InputLabel>
                <Select
                  value={formData.gradeId}
                  label="Grade"
                  onChange={(e) => handleChange('gradeId', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {grades.map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Class */}
            <Grid xs={12} sm={6}>
              <FormControl fullWidth disabled={!formData.gradeId}>
                <InputLabel>Class</InputLabel>
                <Select
                  value={formData.classId}
                  label="Class"
                  onChange={(e) => handleChange('classId', e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {availableClasses.map((cls: any) => (
                    <MenuItem key={cls.id || cls._id} value={cls.id || cls._id}>
                      {cls.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Enrollment Date */}
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Enrollment Date"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => handleChange('enrollmentDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Enrollment Status */}
            <Grid xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Enrollment Status</InputLabel>
                <Select
                  value={formData.enrollmentStatus}
                  label="Enrollment Status"
                  onChange={(e) => handleChange('enrollmentStatus', e.target.value)}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CancelIcon />} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
          disabled={!isValid || loading}
        >
          {loading ? 'Saving...' : student ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

