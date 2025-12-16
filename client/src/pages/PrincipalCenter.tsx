import { useState, type JSX } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import FlagIcon from '@mui/icons-material/Flag';
import ForumIcon from '@mui/icons-material/Forum';
import GppBadIcon from '@mui/icons-material/GppBad';

import SamplePageOverlay from '../components/samplePageOverlay';

export default function PrincipalCenter(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainPage = location.pathname === '/principal';
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState(false);

  const stats = [
    { name: 'Active Logs', value: '24', icon: <ForumIcon />, color: 'primary', change: '+3 today' },
    { name: 'Flagged Students', value: '12', icon: <FlagIcon />, color: 'warning', change: '2 urgent' },
    { name: 'Scheduled Meetings', value: '8', icon: <PeopleIcon />, color: 'secondary', change: '3 this week' },
    { name: 'Pending Reviews', value: '6', icon: <WarningAmberIcon />, color: 'error', change: 'Needs attention' },
  ];

  const recentActivity = [
    { id: 1, title: 'Parent meeting with Mrs. Cohen', student: 'Sarah Cohen', time: '2 hours ago', priority: 'normal' },
    { id: 2, title: 'Student flagged for academic support', student: 'Rivka Goldstein', time: '3 hours ago', priority: 'high' },
    { id: 3, title: 'Follow-up meeting scheduled', student: 'Leah Schwartz', time: '5 hours ago', priority: 'normal' },
    { id: 4, title: 'Behavior concern noted', student: 'Chaya Friedman', time: '1 day ago', priority: 'urgent' },
  ];

  const urgentFlags = [
    { student: 'Miriam Levy', grade: '2nd Grade', issue: 'Academic - Math struggles', date: '2024-11-20' },
    { student: 'Devorah Klein', grade: '3rd Grade', issue: 'Behavior - Classroom disruption', date: '2024-11-21' },
  ];

  if (!isMainPage) return <Outlet />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">Principal Center</Typography>
          <Typography variant="body2" color="text.secondary">
            Student tracking, logs, and administrative oversight
          </Typography>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            color="error"
            startIcon={<GppBadIcon />}
            onClick={() => setIsIncidentDialogOpen(true)}
          >
            Report Incident
          </Button>
          <Chip label="Principal Access" color="secondary" />
        </Stack>
      </Stack>

      {/* Incident Dialog */}
      <Dialog open={isIncidentDialogOpen} onClose={() => setIsIncidentDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Report Incident</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Document a student incident for administrative tracking and follow-up
            </Typography>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Student Involved</MenuItem>
              {['Sarah Cohen','Rivka Goldstein','Leah Schwartz','Chaya Friedman','Miriam Levy','Devorah Klein']
                .map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>

            <Stack direction="row" spacing={2}>
              <TextField type="date" label="Date" fullWidth InputLabelProps={{ shrink: true }} />
              <TextField type="time" label="Time" fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Incident Type</MenuItem>
              {['Behavioral','Academic','Safety','Medical','Bullying','Property','Attendance','Other']
                .map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </Select>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Severity</MenuItem>
              {['Minor','Moderate','Serious','Critical']
                .map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>

            <TextField label="Location" fullWidth />
            <TextField label="Reporting Staff" fullWidth />
            <TextField label="Other Students Involved" fullWidth />
            <TextField label="Description" multiline rows={4} fullWidth />
            <TextField label="Immediate Actions Taken" multiline rows={3} fullWidth />

            <Stack direction="row" spacing={2}>
              <Select fullWidth displayEmpty>
                <MenuItem value="">Parent Notified?</MenuItem>
                {['Yes','Pending','No'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
              <Select fullWidth displayEmpty>
                <MenuItem value="">Follow-up Required?</MenuItem>
                {['Yes','Monitoring','Meeting','No'].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
              </Select>
            </Stack>

            <TextField label="Witnesses" fullWidth />
            <TextField label="Additional Notes" multiline rows={3} fullWidth />

            <Divider />

            <Stack>
              <FormControlLabel control={<Checkbox />} label="Flag student for additional monitoring" />
              <FormControlLabel control={<Checkbox />} label="Request administrative review" />
              <FormControlLabel control={<Checkbox />} label="Refer to counselor/therapist" />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="error" startIcon={<GppBadIcon />}>
            Submit Incident
          </Button>
          <Button variant="outlined" onClick={() => setIsIncidentDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {stats.map(stat => (
          <Card key={stat.name} sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={1}>
                <Chip icon={stat.icon} label={stat.name} color={stat.color as any} />
                <Typography variant="h6">{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">{stat.change}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Activity + Flags */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography fontWeight={500}>Recent Activity</Typography>
              <Link to="/principal/student-logs">View All</Link>
            </Stack>

            <Stack spacing={2}>
              {recentActivity.map(a => (
                <Paper key={a.id} variant="outlined" sx={{ p: 2 }}>
                  <Typography fontWeight={500}>{a.title}</Typography>
                  <Typography variant="body2">{a.student}</Typography>
                  <Typography variant="caption" color="text.secondary">{a.time}</Typography>
                  {a.priority === 'urgent' && <Chip size="small" color="error" label="Urgent" />}
                  {a.priority === 'high' && <Chip size="small" color="warning" label="High Priority" />}
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Typography fontWeight={500}>Urgent Flags</Typography>
              <Chip label={urgentFlags.length} color="error" />
            </Stack>

            <Stack spacing={2}>
              {urgentFlags.map((f, i) => (
                <Paper
                  key={i}
                  sx={{ p: 2, bgcolor: 'error.50', cursor: 'pointer' }}
                  onClick={() => navigate('/principal/flagged-students')}
                >
                  <Typography fontWeight={500}>{f.student}</Typography>
                  <Typography variant="body2">{f.grade}</Typography>
                  <Typography variant="caption" color="error.main">{f.issue}</Typography>
                  <Typography variant="caption" color="text.secondary">Flagged: {f.date}</Typography>
                </Paper>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography fontWeight={500} mb={2}>Quick Actions</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/principal/student-logs')} startIcon={<ForumIcon />}>
              Add Log Entry
            </Button>
            <Button variant="outlined" onClick={() => navigate('/principal/flagged-students')} startIcon={<FlagIcon />}>
              Flag Student
            </Button>
            <Button variant="outlined" onClick={() => navigate('/principal/parent-meetings')} startIcon={<PeopleIcon />}>
              Schedule Meeting
            </Button>
            <Button variant="outlined" startIcon={<DescriptionIcon />}>
              Generate Report
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
