import { useState, type JSX } from 'react';

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
  TextField,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Divider,
  Paper,
} from '@mui/material';

import FlagIcon from '@mui/icons-material/Flag';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';

import SamplePageOverlay from '../../components/samplePageOverlay';

interface FlaggedStudent {
  id: number;
  student: string;
  grade: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'academic' | 'behavior' | 'social' | 'attendance' | 'medical';
  issue: string;
  description: string;
  flaggedBy: string;
  flaggedDate: string;
  interventions: string[];
  status: 'active' | 'improving' | 'resolved';
  lastUpdate: string;
  notes?: string;
}

export default function FlaggedStudents(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'urgent' | 'active' | 'improving'>('all');

  const flaggedStudents: FlaggedStudent[] = [
    {
      id: 1,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      priority: 'urgent',
      category: 'academic',
      issue: 'Math struggles - consistently scoring below grade level',
      description:
        'Miriam is having difficulty with basic addition and subtraction.',
      flaggedBy: 'Mrs. Friedman',
      flaggedDate: '2024-11-20',
      interventions: ['Math tutor assigned', 'Extra practice worksheets'],
      status: 'active',
      lastUpdate: '2024-11-24',
      notes: 'Parent agreed to practice flashcards at home.',
    },
    {
      id: 2,
      student: 'Devorah Klein',
      grade: '3rd Grade',
      priority: 'urgent',
      category: 'behavior',
      issue: 'Classroom disruption',
      description: 'Talking during instruction and arguing when redirected.',
      flaggedBy: 'Mrs. Schwartz',
      flaggedDate: '2024-11-21',
      interventions: ['Seat change', 'Behavior chart'],
      status: 'active',
      lastUpdate: '2024-11-25',
    },
    {
      id: 3,
      student: 'Rachel Berkowitz',
      grade: '1st Grade',
      priority: 'high',
      category: 'social',
      issue: 'Difficulty making friends',
      description: 'Plays alone during recess.',
      flaggedBy: 'Mrs. Cohen',
      flaggedDate: '2024-11-18',
      interventions: ['Lunch bunch', 'Peer buddy'],
      status: 'improving',
      lastUpdate: '2024-11-23',
    },
  ];

  const filtered = flaggedStudents.filter(
    s =>
      s.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.issue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: flaggedStudents.length,
    active: filtered.filter(s => s.status === 'active').length,
    urgent: filtered.filter(s => s.priority === 'urgent').length,
    improving: filtered.filter(s => s.status === 'improving').length,
  };

  const priorityColor = (p: string) =>
    p === 'urgent' ? 'error' : p === 'high' ? 'warning' : 'default';

  const statusColor = (s: string) =>
    s === 'active' ? 'warning' : s === 'improving' ? 'success' : 'default';

  const visible =
    tab === 'all'
      ? filtered
      : filtered.filter(s =>
          tab === 'urgent'
            ? s.priority === 'urgent'
            : s.status === tab
        );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">Flagged Students</Typography>
          <Typography variant="body2" color="text.secondary">
            Students requiring special attention and intervention
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="warning"
          startIcon={<FlagIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Flag Student
        </Button>
      </Stack>

      {/* Flag Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Flag Student for Attention</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Select fullWidth displayEmpty>
              <MenuItem value="">Student</MenuItem>
              <MenuItem value="1">Sarah Cohen - 3rd Grade</MenuItem>
              <MenuItem value="2">Rivka Goldstein - 3rd Grade</MenuItem>
            </Select>

            <Stack direction="row" spacing={2}>
              <Select fullWidth displayEmpty>
                <MenuItem value="">Priority</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>

              <Select fullWidth displayEmpty>
                <MenuItem value="">Category</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="behavior">Behavior</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="attendance">Attendance</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
              </Select>
            </Stack>

            <TextField label="Issue Summary" fullWidth />
            <TextField label="Detailed Description" multiline rows={4} fullWidth />
            <TextField label="Interventions / Action Plan" multiline rows={3} fullWidth />
            <TextField label="Additional Notes" multiline rows={2} fullWidth />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="warning" startIcon={<FlagIcon />}>
            Flag Student
          </Button>
          <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {[
          { label: 'Total Flagged', value: stats.total, icon: <FlagIcon /> },
          { label: 'Active', value: stats.active, icon: <WarningAmberIcon /> },
          { label: 'Urgent', value: stats.urgent, icon: <WarningAmberIcon color="error" /> },
          { label: 'Improving', value: stats.improving, icon: <TrendingUpIcon color="success" /> },
        ].map(s => (
          <Card key={s.label} sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {s.label}
                  </Typography>
                  <Typography variant="h6">{s.value}</Typography>
                </Box>
                {s.icon}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Search */}
      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by student or concern..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab value="all" label={`All (${filtered.length})`} />
        <Tab value="urgent" label={`Urgent (${stats.urgent})`} />
        <Tab value="active" label={`Active (${stats.active})`} />
        <Tab value="improving" label={`Improving (${stats.improving})`} />
      </Tabs>

      {/* List */}
      <Stack spacing={2}>
        {visible.map(student => (
          <Card
            key={student.id}
            sx={{
              borderLeft: 4,
              borderColor:
                student.priority === 'urgent'
                  ? 'error.main'
                  : student.priority === 'high'
                  ? 'warning.main'
                  : 'divider',
            }}
          >
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>{student.student}</Typography>
                  <Chip label={student.grade} size="small" variant="outlined" />
                  <Chip
                    label={student.priority.toUpperCase()}
                    size="small"
                    color={priorityColor(student.priority)}
                  />
                  <Chip
                    label={student.status}
                    size="small"
                    color={statusColor(student.status)}
                  />
                </Stack>

                <Typography variant="body2" fontWeight={500}>
                  {student.issue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.description}
                </Typography>

                <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                  <Typography variant="body2" fontWeight={500}>
                    Interventions
                  </Typography>
                  {student.interventions.map((i, idx) => (
                    <Typography key={idx} variant="body2">
                      • {i}
                    </Typography>
                  ))}
                </Paper>

                {student.notes && (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Recent Notes
                    </Typography>
                    <Typography variant="body2">{student.notes}</Typography>
                  </Paper>
                )}

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Flagged by {student.flaggedBy} • {student.flaggedDate} • Updated{' '}
                    {student.lastUpdate}
                  </Typography>

                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined">
                      Add Note
                    </Button>
                    <Button size="small" variant="outlined">
                      Edit Flag
                    </Button>
                    <Button size="small" variant="outlined" color="success">
                      {student.status === 'improving' ? 'Mark Resolved' : 'Update Status'}
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
