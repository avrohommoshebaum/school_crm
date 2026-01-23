import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  Comment,
  Flag,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const mockDivision = {
  id: '1',
  name: 'Primary Division',
  grades: ['Kindergarten', '1st Grade', '2nd Grade'],
  hebrewPrincipal: 'Mrs. Goldstein',
  englishPrincipal: 'Mrs. Schwartz',
  studentCount: 145,
  classCount: 9,
  avgHebrewPerformance: 84,
  avgEnglishPerformance: 86,
  avgBehavior: 87,
  attendanceRate: 95,
};

const mockLogs = [
  { id: '1', date: '2026-01-14', type: 'Concern', category: 'Hebrew', author: 'Mrs. Goldstein', content: 'Need to focus more on Hebrew reading comprehension across all grades', priority: 'High', comments: 2 },
  { id: '2', date: '2026-01-13', type: 'Achievement', category: 'English', author: 'Mrs. Schwartz', content: 'Excellent progress in English writing skills', priority: 'Medium', comments: 1 },
  { id: '3', date: '2026-01-10', type: 'Observation', category: 'Behavior', author: 'Mrs. Cohen', content: 'Students are adjusting well to new classroom routines', priority: 'Low', comments: 0 },
];

const mockProgress = [
  { subject: 'Hebrew Reading', target: 85, current: 84, trend: 2 },
  { subject: 'Hebrew Writing', target: 80, current: 82, trend: 3 },
  { subject: 'English Reading', target: 85, current: 86, trend: 1 },
  { subject: 'English Writing', target: 83, current: 85, trend: 2 },
  { subject: 'Math', target: 85, current: 87, trend: 2 },
  { subject: 'Science', target: 82, current: 84, trend: 1 },
];

const performanceData = [
  { month: 'Sep', hebrew: 78, english: 80, behavior: 82 },
  { month: 'Oct', hebrew: 80, english: 82, behavior: 84 },
  { month: 'Nov', hebrew: 81, english: 84, behavior: 85 },
  { month: 'Dec', hebrew: 83, english: 85, behavior: 86 },
  { month: 'Jan', hebrew: 84, english: 86, behavior: 87 },
];

export default function DivisionDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tabValue, setTabValue] = useState(0);
  const [openLogDialog, setOpenLogDialog] = useState(false);
  const [openProgressDialog, setOpenProgressDialog] = useState(false);
  const [openCommentDialog, setOpenCommentDialog] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  const [logForm, setLogForm] = useState({
    type: 'Observation',
    category: 'General',
    priority: 'Medium',
    content: '',
  });

  const [progressForm, setProgressForm] = useState({
    subject: '',
    topic: '',
    target: '',
    current: '',
    notes: '',
  });

  const [comment, setComment] = useState('');

  const handleAddLog = () => {
    console.log('Adding log:', logForm);
    setOpenLogDialog(false);
    setLogForm({ type: 'Observation', category: 'General', priority: 'Medium', content: '' });
  };

  const handleAddProgress = () => {
    console.log('Adding progress:', progressForm);
    setOpenProgressDialog(false);
    setProgressForm({ subject: '', topic: '', target: '', current: '', notes: '' });
  };

  const handleAddComment = () => {
    console.log('Adding comment to log:', selectedLog?.id, comment);
    setOpenCommentDialog(false);
    setComment('');
    setSelectedLog(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/principal/head-principal/division-overview')}
          sx={{ mb: 2 }}
        >
          Back to Divisions
        </Button>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              {mockDivision.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comprehensive division overview and tracking
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={() => setOpenProgressDialog(true)}
            >
              Add Progress
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenLogDialog(true)}
              sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              Add Log
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Overview" />
          <Tab label="Logs & Concerns" />
          <Tab label="Progress Tracking" />
          <Tab label="Grades" />
        </Tabs>
      </Box>

      {/* Overview Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Key Metrics */}
          <Grid xs={12} md={6} lg={3}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Total Students
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#667eea', mt: 1 }}>
                  {mockDivision.studentCount}
                </Typography>
                <Typography variant="caption" color="success.main">
                  Across {mockDivision.classCount} classes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(67, 233, 123, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Hebrew Performance
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#43e97b', mt: 1 }}>
                  {mockDivision.avgHebrewPerformance}
                </Typography>
                <Chip icon={<TrendingUp />} label="+2 points" size="small" color="success" sx={{ mt: 0.5 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  English Performance
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#f093fb', mt: 1 }}>
                  {mockDivision.avgEnglishPerformance}
                </Typography>
                <Chip icon={<TrendingUp />} label="+3 points" size="small" color="success" sx={{ mt: 0.5 }} />
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={6} lg={3}>
            <Card sx={{ background: 'linear-gradient(135deg, rgba(255, 217, 61, 0.1) 0%, rgba(250, 112, 154, 0.1) 100%)' }}>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  Attendance Rate
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#ffd93d', mt: 1 }}>
                  {mockDivision.attendanceRate}%
                </Typography>
                <Chip icon={<TrendingUp />} label="+1.2%" size="small" color="success" sx={{ mt: 0.5 }} />
              </CardContent>
            </Card>
          </Grid>

          {/* Performance Chart */}
          <Grid xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Division Performance Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="hebrew" stroke="#667eea" strokeWidth={2} name="Hebrew" />
                  <Line type="monotone" dataKey="english" stroke="#f093fb" strokeWidth={2} name="English" />
                  <Line type="monotone" dataKey="behavior" stroke="#43e97b" strokeWidth={2} name="Behavior" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* Division Info */}
          <Grid xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Division Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Grades in Division:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                  {mockDivision.grades.map((grade) => (
                    <Chip 
                      key={grade} 
                      label={grade} 
                      size="small" 
                      sx={{ bgcolor: '#e3f2fd', cursor: 'pointer' }}
                      onClick={() => navigate(`/principal/head-principal/grade/${grade}`)}
                    />
                  ))}
                </Box>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Hebrew Principal:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#667eea', fontSize: '0.875rem' }}>
                    {mockDivision.hebrewPrincipal[0]}
                  </Avatar>
                  <Typography variant="body2">{mockDivision.hebrewPrincipal}</Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  English Principal:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#f093fb', fontSize: '0.875rem' }}>
                    {mockDivision.englishPrincipal[0]}
                  </Avatar>
                  <Typography variant="body2">{mockDivision.englishPrincipal}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Logs & Concerns Tab */}
      <TabPanel value={tabValue} index={1}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Content</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Comments</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.type}
                      size="small"
                      color={log.type === 'Concern' ? 'error' : log.type === 'Achievement' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{log.category}</TableCell>
                  <TableCell>{log.content}</TableCell>
                  <TableCell>{log.author}</TableCell>
                  <TableCell>
                    <Chip
                      label={log.priority}
                      size="small"
                      sx={{
                        bgcolor: log.priority === 'High' ? '#ffebee' : log.priority === 'Medium' ? '#fff3e0' : '#e8f5e9',
                        color: log.priority === 'High' ? '#c62828' : log.priority === 'Medium' ? '#ef6c00' : '#2e7d32',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip label={log.comments} size="small" icon={<Comment />} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedLog(log);
                        setOpenCommentDialog(true);
                      }}
                    >
                      <Comment />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Progress Tracking Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={2}>
          {mockProgress.map((item) => (
            <Grid xs={12} md={6} key={item.subject}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                      {item.subject}
                    </Typography>
                    <Chip
                      icon={<TrendingUp />}
                      label={`+${item.trend}`}
                      size="small"
                      color="success"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current: {item.current}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {item.target}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(item.current / item.target) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.current >= item.target ? '#43e97b' : '#667eea',
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {((item.current / item.target) * 100).toFixed(0)}% of target achieved
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Grades Tab */}
      <TabPanel value={tabValue} index={3}>
        <Grid container spacing={2}>
          {mockDivision.grades.map((grade) => (
            <Grid xs={12} sm={6} md={4} key={grade}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(`/principal/head-principal/grade/${grade}`)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {grade}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click to view details
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Add Log Dialog */}
      <Dialog open={openLogDialog} onClose={() => setOpenLogDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Division Log</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={logForm.type}
                  onChange={(e) => setLogForm({ ...logForm, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="Observation">Observation</MenuItem>
                  <MenuItem value="Concern">Concern</MenuItem>
                  <MenuItem value="Achievement">Achievement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={logForm.category}
                  onChange={(e) => setLogForm({ ...logForm, category: e.target.value })}
                  label="Category"
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="Hebrew">Hebrew</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="Behavior">Behavior</MenuItem>
                  <MenuItem value="Attendance">Attendance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={logForm.priority}
                  onChange={(e) => setLogForm({ ...logForm, priority: e.target.value })}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Content"
                value={logForm.content}
                onChange={(e) => setLogForm({ ...logForm, content: e.target.value })}
                placeholder="Enter log details..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLog} disabled={!logForm.content}>
            Add Log
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Progress Dialog */}
      <Dialog open={openProgressDialog} onClose={() => setOpenProgressDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Progress Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Subject"
                value={progressForm.subject}
                onChange={(e) => setProgressForm({ ...progressForm, subject: e.target.value })}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                label="Topic"
                value={progressForm.topic}
                onChange={(e) => setProgressForm({ ...progressForm, topic: e.target.value })}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Target Score"
                value={progressForm.target}
                onChange={(e) => setProgressForm({ ...progressForm, target: e.target.value })}
              />
            </Grid>
            <Grid xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Current Score"
                value={progressForm.current}
                onChange={(e) => setProgressForm({ ...progressForm, current: e.target.value })}
              />
            </Grid>
            <Grid xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={progressForm.notes}
                onChange={(e) => setProgressForm({ ...progressForm, notes: e.target.value })}
                placeholder="Add any relevant notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenProgressDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddProgress}
            disabled={!progressForm.subject || !progressForm.target || !progressForm.current}
          >
            Add Progress
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Comment Dialog */}
      <Dialog open={openCommentDialog} onClose={() => setOpenCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Comment to Log</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Original Log:
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {selectedLog.content}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add your comment..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCommentDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddComment} disabled={!comment}>
            Add Comment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

