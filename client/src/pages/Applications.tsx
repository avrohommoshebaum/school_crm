import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

import SamplePageOverlay from '../components/samplePageOverlay';
import type { JSX } from 'react';

interface Application {
  id: number;
  name: string;
  grade: string;
  status: 'pending' | 'interview scheduled' | 'accepted';
  date: string;
}

export default function Applications(): JSX.Element {
  const applications: Application[] = [
    { id: 1, name: 'Rachel Berkowitz', grade: '1st Grade', status: 'pending', date: '2024-11-20' },
    { id: 2, name: 'Devorah Klein', grade: '3rd Grade', status: 'interview scheduled', date: '2024-11-18' },
    { id: 3, name: 'Esther Rosenberg', grade: '2nd Grade', status: 'accepted', date: '2024-11-15' },
  ];

  const getStatusColor = (
    status: Application['status']
  ): 'warning' | 'info' | 'success' | 'default' => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'interview scheduled':
        return 'info';
      case 'accepted':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5 }}>
            Student Applications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage new student applications
          </Typography>
        </Box>

        <Button
          component={Link}
          to="/applications/new"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Application
        </Button>
      </Box>

      {/* Applications Card */}
      <Card>
        <CardHeader title="Pending Applications" />
        <CardContent>
          <Stack spacing={2}>
            {applications.map((app) => (
              <Paper
                key={app.id}
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>
                    {app.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {app.grade} • Applied {app.date}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip
                    label={app.status}
                    color={getStatusColor(app.status)}
                    size="small"
                  />
                  <Button variant="outlined" size="small">
                    Review
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
