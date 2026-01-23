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
  Divider,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import GppBadIcon from '@mui/icons-material/GppBad';

import SamplePageOverlay from '../../components/samplePageOverlay';

export default function BehaviorTracking(): JSX.Element {
  const [isIncidentDialogOpen, setIsIncidentDialogOpen] = useState<boolean>(false);

  const behaviorReports = [
    {
      id: 1,
      student: 'Devorah Klein',
      grade: '3rd Grade',
      incident: 'Talking during class',
      date: '2024-11-25',
      severity: 'minor',
      action: 'Verbal warning',
      trend: 'improving',
    },
    {
      id: 2,
      student: 'Chaya Friedman',
      grade: '5th Grade',
      incident: 'Incomplete homework',
      date: '2024-11-24',
      severity: 'minor',
      action: 'Parent notification',
      trend: 'stable',
    },
  ];

  const getSeverityColor = (
    severity: string
  ): 'error' | 'warning' | 'info' | 'default' => {
    switch (severity) {
      case 'major':
      case 'critical':
        return 'error';
      case 'moderate':
        return 'warning';
      case 'minor':
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
          <Typography variant="h5">Behavior Tracking</Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor and track student behavior incidents
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="warning"
          startIcon={<WarningAmberIcon />}
          onClick={() => setIsIncidentDialogOpen(true)}
        >
          Report Incident
        </Button>
      </Stack>

      {/* Incident Dialog */}
      <Dialog
        open={isIncidentDialogOpen}
        onClose={() => setIsIncidentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Report Incident</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>

            <Typography variant="body2" color="text.secondary">
              Document a student incident for administrative tracking and follow-up
            </Typography>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Student Involved</MenuItem>
              {[
                'Sarah Cohen - 1st Grade',
                'Rivka Goldstein - 2nd Grade',
                'Leah Schwartz - 3rd Grade',
                'Chaya Friedman - 4th Grade',
                'Miriam Levy - 2nd Grade',
                'Devorah Klein - 3rd Grade',
              ].map(s => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </Select>

            <Stack direction="row" spacing={2}>
              <TextField
                type="date"
                label="Date of Incident"
                fullWidth
                defaultValue={new Date().toISOString().split('T')[0]}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                type="time"
                label="Time of Incident"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Incident Type</MenuItem>
              {[
                'Behavioral',
                'Academic',
                'Safety',
                'Medical',
                'Bullying',
                'Property',
                'Attendance',
                'Other',
              ].map(t => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </Select>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Severity Level</MenuItem>
              <MenuItem value="minor">Minor – Warning</MenuItem>
              <MenuItem value="moderate">Moderate – Intervention</MenuItem>
              <MenuItem value="serious">Serious – Immediate Action</MenuItem>
              <MenuItem value="critical">Critical – Emergency</MenuItem>
            </Select>

            <Select fullWidth displayEmpty>
              <MenuItem value="">Location</MenuItem>
              {[
                'Classroom',
                'Hallway',
                'Cafeteria',
                'Playground',
                'Bathroom',
                'Gym',
                'Library',
                'Office',
                'Bus',
                'Other',
              ].map(l => (
                <MenuItem key={l} value={l}>{l}</MenuItem>
              ))}
            </Select>

            <TextField label="Reporting Staff Member" fullWidth />
            <TextField label="Other Students Involved" fullWidth />

            <TextField
              label="Detailed Description"
              multiline
              rows={4}
              fullWidth
            />

            <TextField
              label="Immediate Actions Taken"
              multiline
              rows={3}
              fullWidth
            />

            <Stack direction="row" spacing={2}>
              <Select fullWidth displayEmpty>
                <MenuItem value="">Parent Notified?</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>

              <Select fullWidth displayEmpty>
                <MenuItem value="">Follow-up Required?</MenuItem>
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="monitoring">Monitoring</MenuItem>
                <MenuItem value="meeting">Parent Meeting</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </Select>
            </Stack>

            <TextField label="Witnesses" fullWidth />

            <TextField
              label="Additional Notes"
              multiline
              rows={3}
              fullWidth
            />

            <Divider />

            <Stack>
              <FormControlLabel
                control={<Checkbox />}
                label="Flag student for additional monitoring"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Request administrative review"
              />
              <FormControlLabel
                control={<Checkbox />}
                label="Refer to counselor/therapist"
              />
            </Stack>

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            variant="contained"
            color="warning"
            startIcon={<GppBadIcon />}
          >
            Submit Incident Report
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsIncidentDialogOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {[
          { label: 'Total Incidents', value: 8, icon: <WarningAmberIcon color="warning" /> },
          { label: 'This Week', value: 2, icon: <TrendingDownIcon color="success" /> },
          { label: 'Improving', value: 5, icon: <TrendingUpIcon color="primary" /> },
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

      {/* Reports */}
      <Stack spacing={2}>
        {behaviorReports.map(report => (
          <Card key={report.id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} mb={1}>
                    <Typography fontWeight={500}>{report.student}</Typography>
                    <Chip label={report.grade} size="small" variant="outlined" />
                    <Chip
                      label={report.severity}
                      size="small"
                      color={getSeverityColor(report.severity)}
                    />
                  </Stack>

                  <Typography variant="body2">{report.incident}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Action taken: {report.action}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {report.date}
                  </Typography>
                </Box>

                <Button variant="outlined" size="small">
                  View Details
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}

