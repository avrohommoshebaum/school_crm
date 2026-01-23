import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  Button,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Divider,
  Alert,
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  Person,
  Add,
  Email,
  Download,
  Warning,
  TrendingUp,
  TrendingDown,
  Star,
  Send,
  MoreVert,
  School,
  CalendarMonth,
  Visibility,
  EventAvailable,
  Assessment,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

// Mock class data
const mockClassData = {
  id: '1',
  name: 'Kindergarten - Class A',
  grade: 'Kindergarten',
  division: 'Early Childhood',
  teacher: 'Mrs. Klein',
  teacherEmail: 'klein@nby.edu',
  teacherPhone: '(732) 555-0100',
  room: 'Room 101',
  studentCount: 15,
  capacity: 18,
  avgPerformance: 85,
  avgBehavior: 88,
  avgAttendance: 96,
  concernsCount: 0,
  schedule: 'Full Day (8:30 AM - 3:30 PM)',
  hebrewPrincipal: 'Mrs. Goldberg',
  englishPrincipal: 'Mrs. Cohen',
};

const mockStudents = [
  { id: '1', name: 'Sarah Levy', studentId: 'STU001', avgGrade: 92, attendance: 98, behavior: 95, concerns: 0, flagged: false },
  { id: '2', name: 'Rivka Stein', studentId: 'STU002', avgGrade: 88, attendance: 96, behavior: 92, concerns: 0, flagged: false },
  { id: '3', name: 'Chana Weiss', studentId: 'STU003', avgGrade: 85, attendance: 94, behavior: 90, concerns: 1, flagged: true },
  { id: '4', name: 'Leah Cohen', studentId: 'STU004', avgGrade: 90, attendance: 97, behavior: 94, concerns: 0, flagged: false },
  { id: '5', name: 'Rachel Friedman', studentId: 'STU005', avgGrade: 87, attendance: 95, behavior: 91, concerns: 0, flagged: false },
  { id: '6', name: 'Miriam Katz', studentId: 'STU006', avgGrade: 91, attendance: 99, behavior: 96, concerns: 0, flagged: false },
  { id: '7', name: 'Esther Schwartz', studentId: 'STU007', avgGrade: 84, attendance: 93, behavior: 89, concerns: 1, flagged: false },
  { id: '8', name: 'Devorah Klein', studentId: 'STU008', avgGrade: 89, attendance: 96, behavior: 93, concerns: 0, flagged: false },
  { id: '9', name: 'Yael Berger', studentId: 'STU009', avgGrade: 86, attendance: 95, behavior: 90, concerns: 0, flagged: false },
  { id: '10', name: 'Tamar Rosenberg', studentId: 'STU010', avgGrade: 93, attendance: 98, behavior: 97, concerns: 0, flagged: false },
];

const mockSubjects = [
  { id: '1', subject: 'Hebrew - Chumash', teacher: 'Mrs. Klein', avgGrade: 88, trend: 'up' },
  { id: '2', subject: 'Hebrew - Kriah', teacher: 'Mrs. Klein', avgGrade: 86, trend: 'up' },
  { id: '3', subject: 'Hebrew - Parsha', teacher: 'Mrs. Klein', avgGrade: 85, trend: 'stable' },
  { id: '4', subject: 'Math', teacher: 'Mrs. Green', avgGrade: 84, trend: 'up' },
  { id: '5', subject: 'English', teacher: 'Mrs. Brown', avgGrade: 87, trend: 'up' },
  { id: '6', subject: 'Science', teacher: 'Mrs. White', avgGrade: 86, trend: 'stable' },
];

const mockRecentAssignments = [
  { id: '1', subject: 'Hebrew - Chumash', assignment: 'Chapter 5 Test', date: '2026-01-15', avgGrade: 88, completionRate: 100 },
  { id: '2', subject: 'Math', assignment: 'Addition Quiz', date: '2026-01-14', avgGrade: 85, completionRate: 100 },
  { id: '3', subject: 'English', assignment: 'Spelling Test', date: '2026-01-13', avgGrade: 90, completionRate: 93 },
  { id: '4', subject: 'Hebrew - Kriah', assignment: 'Reading Assessment', date: '2026-01-12', avgGrade: 87, completionRate: 100 },
];

const mockAttendance = [
  { date: '2026-01-19', present: 15, absent: 0, late: 0, rate: 100 },
  { date: '2026-01-16', present: 14, absent: 1, late: 0, rate: 93 },
  { date: '2026-01-15', present: 15, absent: 0, late: 0, rate: 100 },
  { date: '2026-01-14', present: 14, absent: 0, late: 1, rate: 93 },
  { date: '2026-01-13', present: 13, absent: 2, late: 0, rate: 87 },
];

const mockBehaviorLogs = [
  {
    id: '1',
    date: '2026-01-15',
    type: 'Positive',
    category: 'Academic',
    student: 'Sarah Levy',
    loggedBy: 'Mrs. Klein',
    description: 'Excellent participation in class discussion',
    action: 'Praised student',
    severity: 'low',
  },
  {
    id: '2',
    date: '2026-01-14',
    type: 'Concern',
    category: 'Behavior',
    student: 'Chana Weiss',
    loggedBy: 'Mrs. Klein',
    description: 'Talking during quiet work time',
    action: 'Spoke with student privately',
    severity: 'low',
  },
  {
    id: '3',
    date: '2026-01-10',
    type: 'Positive',
    category: 'Behavior',
    student: 'Miriam Katz',
    loggedBy: 'Mrs. Klein',
    description: 'Helped a classmate who was struggling',
    action: 'Sent positive note home',
    severity: 'low',
  },
];

const mockSchedule = [
  { time: '8:30 AM - 9:00 AM', subject: 'Morning Circle', teacher: 'Mrs. Klein' },
  { time: '9:00 AM - 10:00 AM', subject: 'Hebrew - Chumash', teacher: 'Mrs. Klein' },
  { time: '10:00 AM - 10:30 AM', subject: 'Snack & Recess', teacher: 'Mrs. Klein' },
  { time: '10:30 AM - 11:15 AM', subject: 'Hebrew - Kriah', teacher: 'Mrs. Klein' },
  { time: '11:15 AM - 12:00 PM', subject: 'Hebrew - Parsha', teacher: 'Mrs. Klein' },
  { time: '12:00 PM - 12:45 PM', subject: 'Lunch', teacher: 'Mrs. Klein' },
  { time: '12:45 PM - 1:30 PM', subject: 'Math', teacher: 'Mrs. Green' },
  { time: '1:30 PM - 2:15 PM', subject: 'English', teacher: 'Mrs. Brown' },
  { time: '2:15 PM - 3:00 PM', subject: 'Science', teacher: 'Mrs. White' },
  { time: '3:00 PM - 3:30 PM', subject: 'Dismissal Prep', teacher: 'Mrs. Klein' },
];

export default function ClassDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [openNoteDialog, setOpenNoteDialog] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      {/* Compact Header */}
      <Paper sx={{ borderBottom: '1px solid #e5e7eb', mb: 0 }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto', px: 3, py: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            size="small"
            sx={{ mb: 2, color: 'text.secondary' }}
          >
            Back to All Classes
          </Button>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: 'primary.main',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                }}
              >
                <School />
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {mockClassData.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    {mockClassData.teacher}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mockClassData.room}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {mockClassData.studentCount} Students
                  </Typography>
                </Stack>
              </Box>
            </Box>

            <Stack direction="row" spacing={3} alignItems="center">
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', lineHeight: 1 }}>
                  {mockClassData.avgPerformance}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Performance</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1 }}>
                  {mockClassData.avgAttendance}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Attendance</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1 }}>
                  {mockClassData.avgBehavior}%
                </Typography>
                <Typography variant="caption" color="text.secondary">Behavior</Typography>
              </Box>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Stack>
          </Box>

          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            variant="scrollable" 
            scrollButtons="auto"
            sx={{ 
              minHeight: 42,
              '& .MuiTab-root': { 
                minHeight: 42, 
                py: 1,
                fontSize: '0.875rem',
                textTransform: 'none',
                fontWeight: 500
              } 
            }}
          >
            <Tab label="Overview" />
            <Tab label="Students" />
            <Tab label="Academic" />
            <Tab label="Attendance" />
            <Tab label="Behavior" />
            <Tab label="Schedule" />
          </Tabs>
        </Box>
      </Paper>

      {/* Content */}
      <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}>
            <Grid xs={12} md={4}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  CLASS INFO
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Grade Level</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mockClassData.grade}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Division</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mockClassData.division}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Room</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mockClassData.room}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Schedule</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mockClassData.schedule}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Capacity</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {mockClassData.studentCount}/{mockClassData.capacity}
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={(mockClassData.studentCount / mockClassData.capacity) * 100} 
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid xs={12} md={4}>
              <Paper sx={{ p: 2.5, mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  STAFF
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Class Teacher</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{mockClassData.teacher}</Typography>
                    <Typography variant="caption" color="text.secondary">{mockClassData.teacherEmail}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      {mockClassData.teacherPhone}
                    </Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Hebrew Principal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mockClassData.hebrewPrincipal}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="caption" color="text.secondary">English Principal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{mockClassData.englishPrincipal}</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

            <Grid xs={12} md={4}>
              <Paper sx={{ p: 2.5, height: '100%' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  QUICK ACTIONS
                </Typography>
                <Stack spacing={1}>
                  <Button variant="outlined" size="small" fullWidth startIcon={<Email />} sx={{ justifyContent: 'flex-start' }}>
                    Email Teacher
                  </Button>
                  <Button variant="outlined" size="small" fullWidth startIcon={<Email />} sx={{ justifyContent: 'flex-start' }}>
                    Email All Parents
                  </Button>
                  <Button variant="outlined" size="small" fullWidth startIcon={<Download />} sx={{ justifyContent: 'flex-start' }}>
                    Download Report
                  </Button>
                  <Button variant="outlined" size="small" fullWidth startIcon={<Add />} onClick={() => setOpenNoteDialog(true)} sx={{ justifyContent: 'flex-start' }}>
                    Add Class Note
                  </Button>
                </Stack>
              </Paper>
            </Grid>

            <Grid xs={12}>
              <Paper sx={{ p: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'text.secondary' }}>
                  RECENT ACTIVITY
                </Typography>
                <Stack spacing={1.5}>
                  {mockBehaviorLogs.slice(0, 4).map((log) => (
                    <Box key={log.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: '#fafafa', borderRadius: 1 }}>
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: 1, 
                        bgcolor: log.type === 'Positive' ? '#e8f5e9' : '#fff3e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {log.type === 'Positive' ? 
                          <Star sx={{ color: '#2e7d32', fontSize: 18 }} /> : 
                          <Warning sx={{ color: '#e65100', fontSize: 18 }} />
                        }
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {log.student} - {log.category}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(log.date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.813rem' }}>
                          {log.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          By {log.loggedBy}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Students Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" size="small" startIcon={<Download />}>
              Export List
            </Button>
          </Box>
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Avg Grade</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Attendance</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Behavior</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockStudents.map((student) => (
                    <TableRow key={student.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${student.avgGrade}%`} 
                          size="small" 
                          sx={{ 
                            bgcolor: student.avgGrade >= 90 ? '#e8f5e9' : student.avgGrade >= 80 ? '#e3f2fd' : '#fff3e0',
                            color: student.avgGrade >= 90 ? '#2e7d32' : student.avgGrade >= 80 ? '#1976d2' : '#e65100',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {student.attendance}%
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {student.behavior}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {student.concerns > 0 ? (
                          <Chip label={`${student.concerns} concern${student.concerns > 1 ? 's' : ''}`} size="small" color="warning" />
                        ) : (
                          <Chip label="Good" size="small" color="success" />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => navigate(`/students/${student.id}`)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Academic Tab */}
        <TabPanel value={activeTab} index={2}>
          <Paper sx={{ mb: 3 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Class Average</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Trend</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockSubjects.map((subject) => (
                    <TableRow key={subject.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{subject.subject}</TableCell>
                      <TableCell>{subject.teacher}</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={`${subject.avgGrade}%`} 
                          size="small" 
                          sx={{ 
                            bgcolor: subject.avgGrade >= 90 ? '#e8f5e9' : subject.avgGrade >= 80 ? '#e3f2fd' : '#fff3e0',
                            color: subject.avgGrade >= 90 ? '#2e7d32' : subject.avgGrade >= 80 ? '#1976d2' : '#e65100',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }} 
                        />
                      </TableCell>
                      <TableCell align="center">
                        {subject.trend === 'up' ? (
                          <TrendingUp fontSize="small" sx={{ color: 'success.main' }} />
                        ) : subject.trend === 'down' ? (
                          <TrendingDown fontSize="small" sx={{ color: 'warning.main' }} />
                        ) : (
                          <Box sx={{ display: 'inline-block', width: 20, height: 2, bgcolor: 'text.secondary', borderRadius: 1 }} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: 'text.secondary' }}>
            RECENT ASSIGNMENTS
          </Typography>
          <Grid container spacing={2}>
            {mockRecentAssignments.map((assignment) => (
              <Grid xs={12} sm={6} md={3} key={assignment.id}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, pr: 1 }}>
                      {assignment.assignment}
                    </Typography>
                    <Chip
                      label={`${assignment.avgGrade}%`}
                      size="small"
                      sx={{ 
                        bgcolor: assignment.avgGrade >= 90 ? '#e8f5e9' : assignment.avgGrade >= 80 ? '#e3f2fd' : '#fff3e0',
                        color: assignment.avgGrade >= 90 ? '#2e7d32' : assignment.avgGrade >= 80 ? '#1976d2' : '#e65100',
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {assignment.subject}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      {assignment.completionRate}% complete
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(assignment.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* Attendance Tab */}
        <TabPanel value={activeTab} index={3}>
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Present</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Absent</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Late</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockAttendance.map((record, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={record.present} size="small" color="success" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align="center">
                        {record.absent > 0 ? (
                          <Chip label={record.absent} size="small" color="error" sx={{ fontWeight: 600 }} />
                        ) : (
                          <Typography variant="body2" color="text.disabled">0</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {record.late > 0 ? (
                          <Chip label={record.late} size="small" color="warning" sx={{ fontWeight: 600 }} />
                        ) : (
                          <Typography variant="body2" color="text.disabled">0</Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {record.rate}%
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>

        {/* Behavior Tab */}
        <TabPanel value={activeTab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" size="small" startIcon={<Add />}>
              Add Log
            </Button>
          </Box>

          <Stack spacing={2}>
            {mockBehaviorLogs.map((log) => (
              <Paper key={log.id} sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 1, 
                    bgcolor: log.type === 'Positive' ? '#e8f5e9' : '#fff3e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {log.type === 'Positive' ? 
                      <Star sx={{ color: '#2e7d32', fontSize: 20 }} /> : 
                      <Warning sx={{ color: '#e65100', fontSize: 20 }} />
                    }
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {log.student} - {log.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(log.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {log.description}
                    </Typography>
                    <Box sx={{ p: 1.5, bgcolor: '#fafafa', borderRadius: 1, mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>Action:</Typography>
                      <Typography variant="caption" color="text.secondary">{log.action}</Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      By {log.loggedBy}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </TabPanel>

        {/* Schedule Tab */}
        <TabPanel value={activeTab} index={5}>
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafafa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockSchedule.map((period, index) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontWeight: 600 }}>{period.time}</TableCell>
                      <TableCell>{period.subject}</TableCell>
                      <TableCell>{period.teacher}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </TabPanel>
      </Box>

      {/* Add Note Dialog */}
      <Dialog open={openNoteDialog} onClose={() => setOpenNoteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Class Note</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid xs={6}>
              <TextField fullWidth select label="Note Type" defaultValue="General" size="small">
                <MenuItem value="General">General</MenuItem>
                <MenuItem value="Academic">Academic</MenuItem>
                <MenuItem value="Behavior">Behavior</MenuItem>
                <MenuItem value="Announcement">Announcement</MenuItem>
              </TextField>
            </Grid>
            <Grid xs={6}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Date"
                defaultValue={new Date().toISOString().split('T')[0]}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth size="small" label="Subject" placeholder="Brief subject line..." />
            </Grid>
            <Grid xs={12}>
              <TextField fullWidth size="small" label="Note" multiline rows={4} placeholder="Enter your note here..." />
            </Grid>
            <Grid xs={12}>
              <FormControlLabel control={<Checkbox />} label="Notify teacher via email" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenNoteDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Note</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

