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
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Snackbar,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
    ],
  },
];

// Grading system types
type GradingSystemType = 'letter' | 'number' | 'hebrew' | 'custom';

interface GradingSystem {
  type: GradingSystemType;
  name: string;
  options: string[];
}

// Predefined grading systems
const gradingSystems: GradingSystem[] = [
  {
    type: 'letter',
    name: 'Letter Grades (A-F)',
    options: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'],
  },
  {
    type: 'number',
    name: 'Number Grades (1-100)',
    options: Array.from({ length: 101 }, (_, i) => i.toString()),
  },
  {
    type: 'hebrew',
    name: 'Alef-Bais (א-ה)',
    options: ['א+', 'א', 'א-', 'ב+', 'ב', 'ב-', 'ג+', 'ג', 'ג-', 'ד', 'ה'],
  },
  {
    type: 'number',
    name: 'Rating (1-5)',
    options: ['5', '4', '3', '2', '1'],
  },
  {
    type: 'custom',
    name: 'Performance Scale',
    options: ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
];

interface SubjectConfig {
  id: string;
  name: string;
  gradingSystem: GradingSystem;
  weight?: number;
}

interface SubjectGrade {
  subjectId: string;
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

export default function TeacherReportCards() {
  const [classes, setClasses] = useState(mockClasses);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [reportCards, setReportCards] = useState<Record<string, ReportCard>>({});
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [bulkGradeDialogOpen, setBulkGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Grading configuration
  const [subjects, setSubjects] = useState<SubjectConfig[]>([
    { id: '1', name: 'Hebrew Reading', gradingSystem: gradingSystems[2] },
    { id: '2', name: 'Hebrew Writing', gradingSystem: gradingSystems[2] },
    { id: '3', name: 'English Reading', gradingSystem: gradingSystems[0] },
    { id: '4', name: 'English Writing', gradingSystem: gradingSystems[0] },
    { id: '5', name: 'Math', gradingSystem: gradingSystems[1] },
    { id: '6', name: 'Science', gradingSystem: gradingSystems[0] },
    { id: '7', name: 'Judaics', gradingSystem: gradingSystems[2] },
    { id: '8', name: 'Behavior', gradingSystem: gradingSystems[3] },
    { id: '9', name: 'Participation', gradingSystem: gradingSystems[3] },
  ]);

  const [bulkGradeSubject, setBulkGradeSubject] = useState('');
  const [bulkGradeValue, setBulkGradeValue] = useState('');

  useEffect(() => {
    if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (selectedClass && selectedQuarter) {
      setLoading(true);
      setTimeout(() => {
        const currentClass = classes.find(c => c.id === selectedClass);
        if (currentClass) {
          const initialReportCards: Record<string, ReportCard> = {};
          currentClass.students.forEach(student => {
            initialReportCards[student.id] = {
              studentId: student.id,
              quarter: selectedQuarter,
              grades: subjects.map(subject => ({
                subjectId: subject.id,
                grade: '',
                comments: '',
              })),
              generalComments: '',
              teacherSignature: currentTeacher.name,
              status: 'draft',
            };
          });
          setReportCards(initialReportCards);
        }
        setLoading(false);
      }, 300);
    }
  }, [selectedClass, selectedQuarter, classes, subjects]);

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
  };

  const handlePublishAll = () => {
    const updated = { ...reportCards };
    Object.keys(updated).forEach(key => {
      updated[key].status = 'published';
    });
    setReportCards(updated);
    setSaved(true);
  };

  const handleBulkGrade = () => {
    if (!bulkGradeSubject || !bulkGradeValue) return;
    
    const updated = { ...reportCards };
    Object.keys(updated).forEach(studentId => {
      const gradeIndex = updated[studentId].grades.findIndex(g => g.subjectId === bulkGradeSubject);
      if (gradeIndex !== -1) {
        updated[studentId].grades[gradeIndex].grade = bulkGradeValue;
      }
    });
    setReportCards(updated);
    setBulkGradeDialogOpen(false);
    setBulkGradeSubject('');
    setBulkGradeValue('');
    setSaved(true);
  };

  const handleCopyComments = (fromStudentId: string, toStudentId: string) => {
    const fromCard = reportCards[fromStudentId];
    if (!fromCard) return;

    setReportCards(prev => ({
      ...prev,
      [toStudentId]: {
        ...prev[toStudentId],
        generalComments: fromCard.generalComments,
      },
    }));
  };

  const currentClass = classes.find(c => c.id === selectedClass);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'completed': return 'info';
      case 'draft': return 'warning';
      default: return 'default';
    }
  };

  const getCompletionProgress = (studentId: string) => {
    const reportCard = reportCards[studentId];
    if (!reportCard) return 0;
    const completedGrades = reportCard.grades.filter(g => g.grade).length;
    return Math.round((completedGrades / subjects.length) * 100);
  };

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
          Report cards updated successfully!
        </Alert>
      </Snackbar>

      {/* Header Controls */}
      <Paper elevation={2} sx={{ mb: 3 }}>
        <Box sx={{ p: 3, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h6">Report Cards</Typography>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<SettingsIcon />}
                onClick={() => setSettingsDialogOpen(true)}
              >
                Configure Subjects
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handlePublishAll}
                disabled={loading}
              >
                Publish All
              </Button>
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={5}>
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
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                {currentClass && (
                  <Alert severity="info" icon={false} sx={{ width: '100%', py: 1.5 }}>
                    <Typography variant="body2">
                      {currentClass.students.length} students • {subjects.length} subjects
                    </Typography>
                  </Alert>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Divider />

        {/* Quick Actions Bar */}
        <Box sx={{ px: 3, py: 2, bgcolor: '#fafafa' }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Quick Actions:
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setBulkGradeDialogOpen(true)}
            >
              Bulk Grade Subject
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Report Cards Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : currentClass ? (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#1976d2' }}>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }}>Student Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }}>Hebrew Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }} align="center">Quarter</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }} align="center">Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }} align="center">Progress</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: 'white', borderBottom: 'none' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentClass.students.map((student, index) => {
                const reportCard = reportCards[student.id];
                const progress = getCompletionProgress(student.id);

                return (
                  <TableRow 
                    key={student.id} 
                    hover
                    sx={{ bgcolor: index % 2 === 0 ? 'white' : '#fafafa' }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{student.name}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{student.hebrewName}</TableCell>
                    <TableCell align="center">
                      <Chip label={selectedQuarter} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={reportCard?.status || 'draft'}
                        color={getStatusColor(reportCard?.status || 'draft')}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'center' }}>
                        <Box
                          sx={{
                            width: 100,
                            height: 8,
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
                        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 40 }}>
                          {progress}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEditReportCard(student)}
                          variant="contained"
                        >
                          Edit Grades
                        </Button>
                        {reportCard?.status === 'published' && (
                          <IconButton size="small" color="primary">
                            <PrintIcon />
                          </IconButton>
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
          subjects={subjects}
          onClose={() => setEditDialogOpen(false)}
          onSave={handleSaveReportCard}
        />
      )}

      {/* Settings Dialog */}
      <SubjectSettingsDialog
        open={settingsDialogOpen}
        subjects={subjects}
        gradingSystems={gradingSystems}
        onClose={() => setSettingsDialogOpen(false)}
        onSave={(newSubjects) => {
          setSubjects(newSubjects);
          setSettingsDialogOpen(false);
        }}
      />

      {/* Bulk Grade Dialog */}
      <Dialog open={bulkGradeDialogOpen} onClose={() => setBulkGradeDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Grade Subject</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Subject</InputLabel>
              <Select
                value={bulkGradeSubject}
                label="Select Subject"
                onChange={(e) => setBulkGradeSubject(e.target.value)}
              >
                {subjects.map(subject => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.name} ({subject.gradingSystem.name})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {bulkGradeSubject && (
              <FormControl fullWidth>
                <InputLabel>Select Grade</InputLabel>
                <Select
                  value={bulkGradeValue}
                  label="Select Grade"
                  onChange={(e) => setBulkGradeValue(e.target.value)}
                >
                  {subjects.find(s => s.id === bulkGradeSubject)?.gradingSystem.options.map(option => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Alert severity="info">
              This will set the same grade for ALL students in this subject.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkGradeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkGrade} variant="contained" disabled={!bulkGradeSubject || !bulkGradeValue}>
            Apply to All Students
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Edit Report Card Dialog Component
interface EditReportCardDialogProps {
  open: boolean;
  student: any;
  reportCard: ReportCard;
  subjects: SubjectConfig[];
  onClose: () => void;
  onSave: (reportCard: ReportCard) => void;
}

function EditReportCardDialog({ open, student, reportCard, subjects, onClose, onSave }: EditReportCardDialogProps) {
  const [formData, setFormData] = useState<ReportCard>(reportCard);

  useEffect(() => {
    setFormData(reportCard);
  }, [reportCard]);

  const handleGradeChange = (subjectId: string, field: string, value: string) => {
    const updatedGrades = formData.grades.map(g =>
      g.subjectId === subjectId ? { ...g, [field]: value } : g
    );
    setFormData({ ...formData, grades: updatedGrades });
  };

  const handleSave = () => {
    onSave({ ...formData, status: 'completed' });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
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
            <Grid container spacing={2}>
              {subjects.map((subject) => {
                const gradeData = formData.grades.find(g => g.subjectId === subject.id);
                
                return (
                  <Grid item xs={12} sm={6} key={subject.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                          {subject.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                          {subject.gradingSystem.name}
                        </Typography>
                        
                        <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
                          <InputLabel>Grade</InputLabel>
                          <Select
                            value={gradeData?.grade || ''}
                            label="Grade"
                            onChange={(e) => handleGradeChange(subject.id, 'grade', e.target.value)}
                          >
                            <MenuItem value="">-</MenuItem>
                            {subject.gradingSystem.options.map(option => (
                              <MenuItem key={option} value={option}>{option}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <TextField
                          size="small"
                          fullWidth
                          placeholder="Comments..."
                          value={gradeData?.comments || ''}
                          onChange={(e) => handleGradeChange(subject.id, 'comments', e.target.value)}
                          multiline
                          rows={2}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
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

// Subject Settings Dialog
interface SubjectSettingsDialogProps {
  open: boolean;
  subjects: SubjectConfig[];
  gradingSystems: GradingSystem[];
  onClose: () => void;
  onSave: (subjects: SubjectConfig[]) => void;
}

function SubjectSettingsDialog({ open, subjects, gradingSystems, onClose, onSave }: SubjectSettingsDialogProps) {
  const [editedSubjects, setEditedSubjects] = useState<SubjectConfig[]>(subjects);

  useEffect(() => {
    setEditedSubjects(subjects);
  }, [subjects]);

  const handleAddSubject = () => {
    const newSubject: SubjectConfig = {
      id: Date.now().toString(),
      name: 'New Subject',
      gradingSystem: gradingSystems[0],
    };
    setEditedSubjects([...editedSubjects, newSubject]);
  };

  const handleRemoveSubject = (id: string) => {
    setEditedSubjects(editedSubjects.filter(s => s.id !== id));
  };

  const handleUpdateSubject = (id: string, field: string, value: any) => {
    setEditedSubjects(editedSubjects.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Subjects & Grading Systems</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {editedSubjects.map((subject) => (
            <Card key={subject.id} variant="outlined">
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="Subject Name"
                      value={subject.name}
                      onChange={(e) => handleUpdateSubject(subject.id, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Grading System</InputLabel>
                      <Select
                        value={gradingSystems.findIndex(gs => gs.name === subject.gradingSystem.name)}
                        label="Grading System"
                        onChange={(e) => handleUpdateSubject(subject.id, 'gradingSystem', gradingSystems[e.target.value as number])}
                      >
                        {gradingSystems.map((gs, index) => (
                          <MenuItem key={index} value={index}>
                            {gs.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={1}>
                    <IconButton onClick={() => handleRemoveSubject(subject.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={handleAddSubject}
            variant="outlined"
            fullWidth
          >
            Add Subject
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onSave(editedSubjects)} variant="contained">
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}