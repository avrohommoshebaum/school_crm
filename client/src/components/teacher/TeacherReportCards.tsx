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
  TextField,
  Stack,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Rating,
  Alert,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';

interface TeacherReportCardsProps {
  teacherId: string;
}

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
    ],
  },
];

// Subjects for grading
const subjects = [
  'Hebrew Reading',
  'Hebrew Writing',
  'English Reading',
  'English Writing',
  'Math',
  'Science',
  'Judaics',
  'Behavior',
  'Participation',
];

// Grade options
const gradeOptions = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'];

interface SubjectGrade {
  subject: string;
  grade: string;
  comments: string;
}

interface ReportCard {
  studentId: string;
  quarter: string;
  grades: SubjectGrade[];
  generalComments: string;
  teacherSignature: string;
  status: 'draft' | 'completed' | 'published';
}

export default function TeacherReportCards({ teacherId }: TeacherReportCardsProps) {
  const [classes, setClasses] = useState(mockClasses);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [reportCards, setReportCards] = useState<Record<string, ReportCard>>({});
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (selectedClass && selectedQuarter) {
      setLoading(true);
      setTimeout(() => {
        // Initialize report cards with empty data
        const currentClass = classes.find(c => c.id === selectedClass);
        if (currentClass) {
          const initialReportCards: Record<string, ReportCard> = {};
          currentClass.students.forEach(student => {
            initialReportCards[student.id] = {
              studentId: student.id,
              quarter: selectedQuarter,
              grades: subjects.map(subject => ({
                subject,
                grade: '',
                comments: '',
              })),
              generalComments: '',
              teacherSignature: '',
              status: 'draft',
            };
          });
          setReportCards(initialReportCards);
        }
        setLoading(false);
      }, 500);
    }
  }, [selectedClass, selectedQuarter, classes]);

  const handleEditReportCard = (student: any) => {
    setSelectedStudent(student);
    setEditDialogOpen(true);
  };

  const handleSaveReportCard = (updatedReportCard: ReportCard) => {
    setReportCards(prev => ({
      ...prev,
      [updatedReportCard.studentId]: updatedReportCard,
    }));
    setEditDialogOpen(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handlePublishAll = () => {
    // Mark all report cards as published
    const updated = { ...reportCards };
    Object.keys(updated).forEach(key => {
      updated[key].status = 'published';
    });
    setReportCards(updated);
  };

  const currentClass = classes.find(c => c.id === selectedClass);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'completed':
        return 'info';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

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
            <FormControl fullWidth>
              <InputLabel>Quarter</InputLabel>
              <Select
                value={selectedQuarter}
                label="Quarter"
                onChange={(e) => setSelectedQuarter(e.target.value)}
              >
                <MenuItem value="Q1">Quarter 1</MenuItem>
                <MenuItem value="Q2">Quarter 2</MenuItem>
                <MenuItem value="Q3">Quarter 3</MenuItem>
                <MenuItem value="Q4">Quarter 4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handlePublishAll}
              disabled={loading}
              sx={{ height: 56 }}
            >
              Publish All Report Cards
            </Button>
          </Grid>
        </Grid>

        {saved && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Report card saved successfully!
          </Alert>
        )}
      </Paper>

      {/* Report Cards Table */}
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
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Quarter</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Progress</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentClass.students.map((student) => {
                const reportCard = reportCards[student.id];
                const completedGrades = reportCard?.grades.filter(g => g.grade).length || 0;
                const totalGrades = subjects.length;
                const progress = Math.round((completedGrades / totalGrades) * 100);

                return (
                  <TableRow key={student.id} hover>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.hebrewName}</TableCell>
                    <TableCell align="center">{selectedQuarter}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={reportCard?.status || 'draft'}
                        color={getStatusColor(reportCard?.status || 'draft')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          {progress}%
                        </Typography>
                        <Box
                          sx={{
                            width: 60,
                            height: 6,
                            bgcolor: '#e0e0e0',
                            borderRadius: 1,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${progress}%`,
                              height: '100%',
                              bgcolor: progress === 100 ? 'success.main' : 'primary.main',
                              transition: 'width 0.3s',
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditReportCard(student)}
                        >
                          Edit
                        </Button>
                        {reportCard?.status === 'published' && (
                          <Button
                            size="small"
                            startIcon={<PrintIcon />}
                            variant="outlined"
                          >
                            Print
                          </Button>
                        )}
                      </Stack>
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
            Select a class to manage report cards
          </Typography>
        </Paper>
      )}

      {/* Edit Report Card Dialog */}
      {editDialogOpen && selectedStudent && (
        <EditReportCardDialog
          open={editDialogOpen}
          student={selectedStudent}
          reportCard={reportCards[selectedStudent.id]}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveReportCard}
        />
      )}
    </Box>
  );
}

// Edit Report Card Dialog Component
interface EditReportCardDialogProps {
  open: boolean;
  student: any;
  reportCard: ReportCard;
  onClose: () => void;
  onSave: (reportCard: ReportCard) => void;
}

function EditReportCardDialog({ open, student, reportCard, onClose, onSave }: EditReportCardDialogProps) {
  const [formData, setFormData] = useState<ReportCard>(reportCard);

  useEffect(() => {
    setFormData(reportCard);
  }, [reportCard]);

  const handleGradeChange = (index: number, field: string, value: string) => {
    const updatedGrades = [...formData.grades];
    updatedGrades[index] = { ...updatedGrades[index], [field]: value };
    setFormData({ ...formData, grades: updatedGrades });
  };

  const handleSave = () => {
    onSave({ ...formData, status: 'completed' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h6">Report Card - {student.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {student.hebrewName} • {formData.quarter}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Subject Grades */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
              Subject Grades
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Comments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.grades.map((gradeItem, index) => (
                    <TableRow key={gradeItem.subject}>
                      <TableCell>{gradeItem.subject}</TableCell>
                      <TableCell>
                        <FormControl size="small" sx={{ minWidth: 100 }}>
                          <Select
                            value={gradeItem.grade}
                            onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                          >
                            <MenuItem value="">-</MenuItem>
                            {gradeOptions.map(grade => (
                              <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Comments..."
                          value={gradeItem.comments}
                          onChange={(e) => handleGradeChange(index, 'comments', e.target.value)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* General Comments */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              General Comments
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter general comments about the student's progress..."
              value={formData.generalComments}
              onChange={(e) => setFormData({ ...formData, generalComments: e.target.value })}
            />
          </Box>

          {/* Teacher Signature */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              Teacher Signature
            </Typography>
            <TextField
              fullWidth
              placeholder="Your name"
              value={formData.teacherSignature}
              onChange={(e) => setFormData({ ...formData, teacherSignature: e.target.value })}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" startIcon={<SaveIcon />}>
          Save Report Card
        </Button>
      </DialogActions>
    </Dialog>
  );
}
