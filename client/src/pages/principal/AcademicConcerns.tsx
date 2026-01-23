import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
} from '@mui/material';

import BookIcon from '@mui/icons-material/MenuBook';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import SamplePageOverlay from '../../components/samplePageOverlay';
import type { JSX } from 'react';

export default function AcademicConcerns(): JSX.Element {
  const concerns = [
    {
      id: 1,
      student: 'Miriam Levy',
      grade: '2nd Grade',
      subject: 'Math',
      issue: 'Below grade level in addition/subtraction',
      intervention: 'Math tutor assigned',
      priority: 'high',
    },
    {
      id: 2,
      student: 'Chaya Friedman',
      grade: '5th Grade',
      subject: 'Reading',
      issue: 'Reading comprehension struggles',
      intervention: 'Reading tutor 2x/week',
      priority: 'medium',
    },
  ];

  const priorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">Academic Concerns</Typography>
          <Typography variant="body2" color="text.secondary">
            Track students requiring academic support
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<BookIcon />}
        >
          Add Concern
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Active Concerns
                </Typography>
                <Typography variant="h6">{concerns.length}</Typography>
              </Box>
              <ErrorOutlineIcon color="warning" />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  With Tutors
                </Typography>
                <Typography variant="h6">2</Typography>
              </Box>
              <BookIcon color="primary" />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  High Priority
                </Typography>
                <Typography variant="h6">
                  {concerns.filter(c => c.priority === 'high').length}
                </Typography>
              </Box>
              <TrendingDownIcon color="error" />
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Concerns List */}
      <Stack spacing={2}>
        {concerns.map(concern => (
          <Card key={concern.id}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  <Typography fontWeight={600}>
                    {concern.student}
                  </Typography>

                  <Chip
                    label={concern.grade}
                    size="small"
                    variant="outlined"
                  />

                  <Chip
                    label={concern.subject}
                    size="small"
                    color="secondary"
                  />

                  <Chip
                    label={`${concern.priority} priority`}
                    size="small"
                    color={priorityColor(concern.priority)}
                  />
                </Stack>

                <Typography variant="body2">
                  {concern.issue}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Intervention: {concern.intervention}
                </Typography>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" variant="outlined">
                    Update
                  </Button>
                  <Button size="small" variant="outlined">
                    View Progress
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

