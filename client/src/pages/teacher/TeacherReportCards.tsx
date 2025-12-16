import { useState, useEffect, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';
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
  Divider,
  Alert,
  IconButton,
  Card,
  CardContent,
  Snackbar,
} from '@mui/material';

import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import PrintIcon from '@mui/icons-material/Print';
import SettingsIcon from '@mui/icons-material/Settings';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import SamplePageOverlay from '../../components/samplePageOverlay';

/* ---------------- Mock Teacher ---------------- */

const currentTeacher = {
  id: 't2',
  name: 'Mrs. Rachel Cohen',
};

/* ---------------- Mock Classes ---------------- */

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

/* ---------------- Types ---------------- */

type GradingSystemType = 'letter' | 'number' | 'hebrew' | 'custom';

interface GradingSystem {
  type: GradingSystemType;
  name: string;
  options: string[];
}

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
    type: 'custom',
    name: 'Performance Scale',
    options: ['Excellent', 'Very Good', 'Good', 'Satisfactory', 'Needs Improvement'],
  },
];

interface SubjectConfig {
  id: string;
  name: string;
  gradingSystem: GradingSystem;
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

/* ================= MAIN COMPONENT ================= */

export default function TeacherReportCards() {
  const [classes] = useState(mockClasses);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');
  const [reportCards, setReportCards] = useState<Record<string, ReportCard>>({});
  const [subjects, setSubjects] = useState<SubjectConfig[]>([
    { id: '1', name: 'Hebrew Reading', gradingSystem: gradingSystems[2] },
    { id: '2', name: 'Hebrew Writing', gradingSystem: gradingSystems[2] },
    { id: '3', name: 'English Reading', gradingSystem: gradingSystems[0] },
    { id: '4', name: 'English Writing', gradingSystem: gradingSystems[0] },
    { id: '5', name: 'Math', gradingSystem: gradingSystems[1] },
  ]);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  useEffect(() => {
    if (!selectedClass && classes.length) {
      setSelectedClass(classes[0].id);
    }
  }, [classes]);

  useEffect(() => {
    if (!selectedClass) return;

    setLoading(true);
    setTimeout(() => {
      const cls = classes.find(c => c.id === selectedClass);
      if (!cls) return;

      const init: Record<string, ReportCard> = {};
      cls.students.forEach(s => {
        init[s.id] = {
          studentId: s.id,
          quarter: selectedQuarter,
          grades: subjects.map(sub => ({
            subjectId: sub.id,
            grade: '',
            comments: '',
          })),
          generalComments: '',
          teacherSignature: currentTeacher.name,
          status: 'draft',
        };
      });

      setReportCards(init);
      setLoading(false);
    }, 300);
  }, [selectedClass, selectedQuarter, subjects, classes]);

  const currentClass = classes.find(c => c.id === selectedClass);

  const completionPercent = (id: string) => {
    const rc = reportCards[id];
    if (!rc) return 0;
    return Math.round(
      (rc.grades.filter(g => g.grade).length / subjects.length) * 100
    );
  };

  /* ================= UI ================= */

  return (

    <Box>
      <SamplePageOverlay />
      <Snackbar open={saved} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          Report cards saved successfully!
        </Alert>
      </Snackbar>

      <Paper sx={{ mb: 3 }}>
        <Box p={3}>
          <Stack direction="row" justifyContent="space-between" mb={3}>
            <Typography variant="h6">Report Cards</Typography>

            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<SettingsIcon />}
                variant="outlined"
                onClick={() => setSettingsDialogOpen(true)}
              >
                Configure Subjects
              </Button>
              <Button variant="contained" color="success">
                Publish All
              </Button>
            </Stack>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                label="Select Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.className}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

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

            {currentClass && (
              <Alert severity="info" sx={{ flex: 1 }}>
                {currentClass.students.length} students • {subjects.length} subjects
              </Alert>
            )}
          </Stack>
        </Box>
      </Paper>

      {loading ? (
        <Box py={8} display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white' }}>Student</TableCell>
                <TableCell sx={{ color: 'white' }}>Hebrew Name</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Status</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Progress</TableCell>
                <TableCell sx={{ color: 'white' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentClass?.students.map((s, i) => {
                const progress = completionPercent(s.id);
                return (
                  <TableRow key={s.id} sx={{ bgcolor: i % 2 ? '#fafafa' : 'white' }}>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{s.hebrewName}</TableCell>
                    <TableCell align="center">
                      <Chip label="Draft" size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Typography fontWeight={600}>{progress}%</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          variant="contained"
                          onClick={() => {
                            setSelectedStudent(s);
                            setEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <IconButton disabled>
                          <PrintIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* SUBJECT SETTINGS DIALOG */}
      <SubjectSettingsDialog
        open={settingsDialogOpen}
        subjects={subjects}
        gradingSystems={gradingSystems}
        onClose={() => setSettingsDialogOpen(false)}
        onSave={setSubjects}
      />

      {/* EDIT REPORT CARD DIALOG */}
      {editDialogOpen && selectedStudent && (
        <EditReportCardDialog
          open={editDialogOpen}
          student={selectedStudent}
          reportCard={reportCards[selectedStudent.id]}
          subjects={subjects}
          onClose={() => setEditDialogOpen(false)}
          onSave={(rc: { studentId: any; }) => {
            setReportCards(prev => ({ ...prev, [rc.studentId]: rc }));
            setEditDialogOpen(false);
            setSaved(true);
          }}
        />
      )}
    </Box>
  );
}

/* ================= DIALOGS ================= */

function EditReportCardDialog({ open, student, reportCard, subjects, onClose, onSave }: any) {
  const [form, setForm] = useState(reportCard);

  useEffect(() => setForm(reportCard), [reportCard]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {student.name} — {student.hebrewName}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {subjects.map((subject: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; gradingSystem: { options: any[]; }; }) => {
            const grade = form.grades.find((g: any) => g.subjectId === subject.id);
            return (
              <Card key={subject.id} variant="outlined">
                <CardContent>
                  <Typography fontWeight={600}>{subject.name}</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Grade</InputLabel>
                    <Select
                      value={grade?.grade || ''}
                      label="Grade"
                      onChange={(e) => {
                        setForm({
                          ...form,
                          grades: form.grades.map((g: any) =>
                            g.subjectId === subject.id ? { ...g, grade: e.target.value } : g
                          ),
                        });
                      }}
                    >
                      {subject.gradingSystem.options.map((opt: string, index: number) => (
                        <MenuItem key={index} value={opt}>{opt}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    sx={{ mt: 1 }}
                    placeholder="Comments"
                    value={grade?.comments || ''}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        grades: form.grades.map((g: any) =>
                          g.subjectId === subject.id ? { ...g, comments: e.target.value } : g
                        ),
                      });
                    }}
                  />
                </CardContent>
              </Card>
            );
          })}

          <Divider />

          <TextField
            label="General Comments"
            multiline
            rows={4}
            fullWidth
            value={form.generalComments}
            onChange={(e) => setForm({ ...form, generalComments: e.target.value })}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          startIcon={<SaveIcon />}
          variant="contained"
          onClick={() => onSave({ ...form, status: 'completed' })}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function SubjectSettingsDialog({ open, subjects, gradingSystems, onClose, onSave }: any) {
  const [local, setLocal] = useState(subjects);

  useEffect(() => setLocal(subjects), [subjects]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Configure Subjects</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {local.map((s: any) => (
            <Card key={s.id} variant="outlined">
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    label="Subject Name"
                    fullWidth
                    value={s.name}
                    onChange={(e) =>
                      setLocal(local.map((x: any) => x.id === s.id ? { ...x, name: e.target.value } : x))
                    }
                  />
                  <FormControl fullWidth>
                    <InputLabel>Grading System</InputLabel>
                    <Select
                      value={gradingSystems.findIndex((gs: { name: any; }) => gs.name === s.gradingSystem.name)}
                      label="Grading System"
                      onChange={(e) =>
                        setLocal(local.map((x: any) =>
                          x.id === s.id ? { ...x, gradingSystem: gradingSystems[e.target.value as number] } : x
                        ))
                      }
                    >
                      {gradingSystems.map((gs: { name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, i: number) => (
                        <MenuItem key={i} value={i}>{gs.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <IconButton color="error" onClick={() => setLocal(local.filter((x: any) => x.id !== s.id))}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}

          <Button startIcon={<AddIcon />} variant="outlined" onClick={() =>
            setLocal([...local, {
              id: Date.now().toString(),
              name: 'New Subject',
              gradingSystem: gradingSystems[0],
            }])
          }>
            Add Subject
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSave(local)}>
          Save Configuration
        </Button>
      </DialogActions>
    </Dialog>
  );
}
