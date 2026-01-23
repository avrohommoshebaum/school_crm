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
} from '@mui/material';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaceIcon from '@mui/icons-material/Place';

import SamplePageOverlay from '../../components/samplePageOverlay';

type Filter = 'all' | 'upcoming' | 'completed';

export default function ParentMeetings(): JSX.Element {
  const [filter, setFilter] = useState<Filter>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const meetings = [
    {
      id: 1,
      student: 'Sarah Cohen',
      grade: '3rd Grade',
      parent: 'Mrs. Rivka Cohen',
      date: '2024-12-01',
      time: '2:30 PM',
      purpose: 'Discuss reading progress and tutoring updates',
      status: 'scheduled',
      location: 'Principal Office',
      notes: 'Follow-up from previous quarter discussion',
    },
    {
      id: 2,
      student: 'Leah Schwartz',
      grade: '4th Grade',
      parent: 'Mrs. Schwartz',
      date: '2024-12-03',
      time: '3:00 PM',
      purpose: 'General check-in meeting',
      status: 'scheduled',
      location: 'Conference Room',
      notes: '',
    },
    {
      id: 3,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      parent: 'Mrs. Levy',
      date: '2024-11-25',
      time: '1:30 PM',
      purpose: 'Math support discussion',
      status: 'completed',
      location: 'Principal Office',
      notes: 'Parents agreed to math tutor, follow-up in 2 weeks',
    },
  ];

  const filteredMeetings = meetings.filter(m => {
    if (filter === 'upcoming') return m.status === 'scheduled';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">Parent Meetings</Typography>
          <Typography variant="body2" color="text.secondary">
            Schedule and track parent-teacher conferences
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Schedule Meeting
        </Button>
      </Stack>

      {/* Schedule Dialog */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Schedule Parent Meeting</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Select fullWidth displayEmpty>
              <MenuItem value="">Select student</MenuItem>
              <MenuItem value="1">Sarah Cohen – 3rd Grade</MenuItem>
              <MenuItem value="2">Rivka Goldstein – 3rd Grade</MenuItem>
              <MenuItem value="3">Leah Schwartz – 4th Grade</MenuItem>
            </Select>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label="Parent / Guardian Name" fullWidth />
              <TextField label="Parent Phone" fullWidth />
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField type="date" label="Meeting Date" InputLabelProps={{ shrink: true }} fullWidth />
              <TextField type="time" label="Meeting Time" InputLabelProps={{ shrink: true }} fullWidth />
            </Stack>

            <Select fullWidth defaultValue="30">
              <MenuItem value="15">15 minutes</MenuItem>
              <MenuItem value="30">30 minutes</MenuItem>
              <MenuItem value="45">45 minutes</MenuItem>
              <MenuItem value="60">1 hour</MenuItem>
            </Select>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Select location</MenuItem>
              <MenuItem value="principal-office">Principal Office</MenuItem>
              <MenuItem value="conference-room">Conference Room</MenuItem>
              <MenuItem value="classroom">Classroom</MenuItem>
              <MenuItem value="virtual">Virtual Meeting</MenuItem>
            </Select>

            <TextField
              label="Meeting Purpose / Agenda"
              multiline
              rows={4}
              fullWidth
            />

            <TextField label="Attendees" fullWidth />
            <TextField label="Preparation Notes" multiline rows={3} fullWidth />

            <FormControlLabel
              control={<Checkbox />}
              label="Send email reminder to parents"
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Add to school calendar"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="contained" color="secondary" startIcon={<CalendarMonthIcon />}>
            Schedule Meeting
          </Button>
          <Button variant="outlined" onClick={() => setIsDialogOpen(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filters */}
      <Stack direction="row" spacing={2}>
        <Button variant={filter === 'all' ? 'contained' : 'outlined'} onClick={() => setFilter('all')}>
          All Meetings
        </Button>
        <Button
          variant={filter === 'upcoming' ? 'contained' : 'outlined'}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={filter === 'completed' ? 'contained' : 'outlined'}
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
      </Stack>

      {/* Meetings List */}
      <Stack spacing={2}>
        {filteredMeetings.map(meeting => (
          <Card key={meeting.id}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>{meeting.student}</Typography>
                  <Chip label={meeting.grade} size="small" variant="outlined" />
                  {meeting.status === 'scheduled' ? (
                    <Chip
                      icon={<AccessTimeIcon />}
                      label="Scheduled"
                      color="success"
                      size="small"
                    />
                  ) : (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Completed"
                      size="small"
                    />
                  )}
                </Stack>

                <Stack spacing={1}>
                  <Stack direction="row" spacing={3} flexWrap="wrap">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <PersonIcon fontSize="small" />
                      <Typography variant="body2">{meeting.parent}</Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonthIcon fontSize="small" />
                      <Typography variant="body2">
                        {meeting.date} at {meeting.time}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      <PlaceIcon fontSize="small" />
                      <Typography variant="body2">{meeting.location}</Typography>
                    </Stack>
                  </Stack>

                  <Typography variant="body2">{meeting.purpose}</Typography>

                  {meeting.notes && (
                    <Typography variant="body2" color="text.secondary" fontStyle="italic">
                      Notes: {meeting.notes}
                    </Typography>
                  )}
                </Stack>

                <Divider />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined">
                    Edit
                  </Button>
                  {meeting.status === 'scheduled' && (
                    <Button size="small" variant="outlined" color="error">
                      Cancel
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

