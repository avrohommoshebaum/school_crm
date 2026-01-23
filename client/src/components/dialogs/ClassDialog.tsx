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
  Chip,
  Box,
  OutlinedInput,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

interface ClassDialogProps {
  open: boolean;
  classData: any | null;
  onClose: () => void;
  onSave: (classData: any) => void;
}

const gradeOptions = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
const statusOptions = ['active', 'inactive'];
const subjectOptions = [
  'Hebrew',
  'English',
  'Math',
  'Science',
  'Social Studies',
  'Judaics',
  'Art',
  'Music',
  'Physical Education',
  'Technology',
];

// Mock teachers - replace with actual API call
const teacherOptions = [
  { id: 't1', name: 'Mrs. Sarah Goldberg' },
  { id: 't2', name: 'Mrs. Rachel Cohen' },
  { id: 't3', name: 'Mrs. Miriam Levy' },
  { id: 't4', name: 'Mrs. Chaya Schwartz' },
  { id: 't5', name: 'Mrs. Devorah Klein' },
  { id: 't6', name: 'Mrs. Leah Friedman' },
  { id: 't7', name: 'Mrs. Rivka Stein' },
];

export default function ClassDialog({ open, classData, onClose, onSave }: ClassDialogProps) {
  const [formData, setFormData] = useState({
    className: '',
    grade: '',
    teacher: '',
    teacherId: '',
    room: '',
    studentCount: 0,
    maxCapacity: 20,
    schedule: '',
    subjects: [] as string[],
    status: 'active',
    schoolYear: '2024-2025',
    notes: '',
  });

  useEffect(() => {
    if (classData) {
      setFormData(classData);
    } else {
      setFormData({
        className: '',
        grade: '',
        teacher: '',
        teacherId: '',
        room: '',
        studentCount: 0,
        maxCapacity: 20,
        schedule: '',
        subjects: [],
        status: 'active',
        schoolYear: '2024-2025',
        notes: '',
      });
    }
  }, [classData, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTeacherChange = (teacherId: string) => {
    const teacher = teacherOptions.find(t => t.id === teacherId);
    setFormData((prev) => ({
      ...prev,
      teacherId,
      teacher: teacher?.name || '',
    }));
  };

  const handleSubmit = () => {
    onSave({ ...formData, id: classData?.id });
  };

  const isValid = formData.className && formData.grade && formData.teacher && formData.room;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {classData ? 'Edit Class' : 'Add New Class'}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          {/* Class Name */}
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Class Name"
              required
              value={formData.className}
              onChange={(e) => handleChange('className', e.target.value)}
              placeholder="e.g., 1st Grade A"
            />
          </Grid>

          {/* Grade */}
          <Grid xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Grade</InputLabel>
              <Select
                value={formData.grade}
                label="Grade"
                onChange={(e) => handleChange('grade', e.target.value)}
              >
                {gradeOptions.map((grade) => (
                  <MenuItem key={grade} value={grade}>
                    {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Teacher */}
          <Grid xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Teacher</InputLabel>
              <Select
                value={formData.teacherId}
                label="Teacher"
                onChange={(e) => handleTeacherChange(e.target.value)}
              >
                {teacherOptions.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Room Number */}
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Room Number"
              required
              value={formData.room}
              onChange={(e) => handleChange('room', e.target.value)}
              placeholder="e.g., 101"
            />
          </Grid>

          {/* Student Count */}
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Current Student Count"
              type="number"
              value={formData.studentCount}
              onChange={(e) => handleChange('studentCount', parseInt(e.target.value) || 0)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          {/* Max Capacity */}
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="Max Capacity"
              type="number"
              value={formData.maxCapacity}
              onChange={(e) => handleChange('maxCapacity', parseInt(e.target.value) || 0)}
              inputProps={{ min: 1 }}
            />
          </Grid>

          {/* Schedule */}
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Schedule"
              value={formData.schedule}
              onChange={(e) => handleChange('schedule', e.target.value)}
              placeholder="e.g., Mon-Fri 8:00 AM - 3:00 PM"
            />
          </Grid>

          {/* Subjects */}
          <Grid xs={12}>
            <FormControl fullWidth>
              <InputLabel>Subjects</InputLabel>
              <Select
                multiple
                value={formData.subjects}
                label="Subjects"
                onChange={(e) => handleChange('subjects', e.target.value)}
                input={<OutlinedInput label="Subjects" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {subjectOptions.map((subject) => (
                  <MenuItem key={subject} value={subject}>
                    {subject}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => handleChange('status', e.target.value)}
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* School Year */}
          <Grid xs={12} sm={6}>
            <TextField
              fullWidth
              label="School Year"
              value={formData.schoolYear}
              onChange={(e) => handleChange('schoolYear', e.target.value)}
              placeholder="e.g., 2024-2025"
            />
          </Grid>

          {/* Notes */}
          <Grid xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Additional information about this class..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} startIcon={<CancelIcon />}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!isValid}
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

