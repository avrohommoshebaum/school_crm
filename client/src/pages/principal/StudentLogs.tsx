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
  Checkbox,
  FormControlLabel,
  Divider,
  InputAdornment,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import MessageIcon from '@mui/icons-material/Message';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

import SamplePageOverlay from '../../components/samplePageOverlay';

type LogType =
  | 'parent-meeting'
  | 'parent-call'
  | 'behavior'
  | 'academic'
  | 'general';

export default function StudentLogs(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | LogType>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const logs = [
    {
      id: 1,
      student: 'Sarah Cohen',
      grade: '3rd Grade',
      type: 'parent-meeting' as LogType,
      title: 'Discussion about reading progress',
      description:
        "Met with Mrs. Cohen to discuss Sarah's reading improvement. Recommended continuing with reading tutor.",
      date: '2024-11-25',
      time: '2:30 PM',
      author: 'Mrs. Schwartz (Principal)',
      followUp: true,
      followUpDate: '2024-12-10',
    },
    {
      id: 2,
      student: 'Rivka Goldstein',
      grade: '3rd Grade',
      type: 'behavior' as LogType,
      title: 'Behavioral concern',
      description:
        'Talking during class and distracting other students. Will monitor for improvement.',
      date: '2024-11-24',
      time: '11:00 AM',
      author: 'Mrs. Schwartz (Principal)',
      followUp: true,
      followUpDate: '2024-12-01',
    },
    {
      id: 3,
      student: 'Leah Schwartz',
      grade: '4th Grade',
      type: 'parent-call' as LogType,
      title: 'Phone call regarding attendance',
      description:
        'Family dealing with illness. Makeup work provided.',
      date: '2024-11-23',
      time: '4:15 PM',
      author: 'Mrs. Klein (Principal)',
      followUp: false,
    },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.student.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const typeColor = (type: LogType) => {
    switch (type) {
      case 'parent-meeting':
        return 'primary';
      case 'parent-call':
        return 'success';
      case 'behavior':
        return 'warning';
      case 'academic':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const typeLabel = (type: LogType) => {
    switch (type) {
      case 'parent-meeting':
        return 'Parent Meeting';
      case 'parent-call':
        return 'Phone Call';
      case 'behavior':
        return 'Behavior';
      case 'academic':
        return 'Academic';
      default:
        return 'General';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">Student Logs</Typography>
          <Typography variant="body2" color="text.secondary">
            Track interactions, meetings, and important notes
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Add Log Entry
        </Button>
      </Stack>

      {/* Add Log Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Log Entry</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Select fullWidth displayEmpty>
              <MenuItem value="">Select student</MenuItem>
              <MenuItem value="1">Sarah Cohen – 3rd Grade</MenuItem>
              <MenuItem value="2">Rivka Goldstein – 3rd Grade</MenuItem>
              <MenuItem value="3">Leah Schwartz – 4th Grade</MenuItem>
            </Select>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Log type</MenuItem>
              <MenuItem value="parent-meeting">Parent Meeting</MenuItem>
              <MenuItem value="parent-call">Phone Call</MenuItem>
              <MenuItem value="behavior">Behavior</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="general">General</MenuItem>
            </Select>

            <TextField label="Title" fullWidth />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField type="date" label="Date" InputLabelProps={{ shrink: true }} fullWidth />
              <TextField type="time" label="Time" InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>

            <TextField
              label="Details"
              multiline
              rows={6}
              fullWidth
            />

            <FormControlLabel
              control={<Checkbox />}
              label="Requires follow-up"
            />

            <TextField type="date" label="Follow-up Date" InputLabelProps={{ shrink: true }} fullWidth />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained">Save Log Entry</Button>
          <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Search & Filter */}
      <Card>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              placeholder="Search by student or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <Select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="parent-meeting">Parent Meetings</MenuItem>
              <MenuItem value="parent-call">Phone Calls</MenuItem>
              <MenuItem value="behavior">Behavior</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {[
          { label: 'Total Logs', value: logs.length, icon: <MessageIcon /> },
          { label: 'This Week', value: 3, icon: <CalendarMonthIcon /> },
          { label: 'Follow-ups', value: logs.filter(l => l.followUp).length, icon: <FilterAltIcon /> },
          { label: 'Students', value: 5, icon: <PersonIcon /> },
        ].map(stat => (
          <Card key={stat.label} sx={{ flex: 1 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h6">{stat.value}</Typography>
                </Box>
                {stat.icon}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Logs List */}
      <Stack spacing={2}>
        {filteredLogs.map(log => (
          <Card key={log.id}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>{log.title}</Typography>
                  <Chip
                    label={typeLabel(log.type)}
                    size="small"
                    color={typeColor(log.type)}
                  />
                  {log.followUp && (
                    <Chip
                      label="Follow-up Required"
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={3} flexWrap="wrap">
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">
                      {log.student} – {log.grade}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <CalendarMonthIcon fontSize="small" />
                    <Typography variant="body2">
                      {log.date} at {log.time}
                    </Typography>
                  </Stack>
                </Stack>

                <Typography variant="body2">{log.description}</Typography>

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">
                    Logged by: {log.author}
                  </Typography>
                  {log.followUp && (
                    <Typography variant="caption" color="warning.main">
                      Follow-up: {log.followUpDate}
                    </Typography>
                  )}
                </Stack>

                <Divider />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined">
                    Edit Log
                  </Button>
                  <Button size="small" variant="outlined">
                    View Student Profile
                  </Button>
                  {log.followUp && (
                    <Button size="small" variant="outlined" color="success">
                      Mark Complete
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <MessageIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography color="text.secondary">
              No logs found matching your criteria
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

