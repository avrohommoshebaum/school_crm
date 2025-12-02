import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Divider,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

export default function ApplicationSettings() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [applicationSettings, setApplicationSettings] = useState({
    acceptingApplications: true,
    applicationDeadline: '2025-03-15',
    startDate: '2025-09-01',
    requirePayment: true,
    applicationFee: '50',
    allowWaitlist: true,
    maxStudents: '500',
    minAge: '5',
    maxAge: '18',
  });

  const [requiredDocuments, setRequiredDocuments] = useState([
    'Birth Certificate',
    'Immunization Records',
    'Previous School Records',
    'Photo ID (Parent/Guardian)',
    'Proof of Residence',
  ]);

  const [gradeSettings, setGradeSettings] = useState([
    { grade: 'Kindergarten', capacity: 40, currentEnrollment: 38, status: 'open' },
    { grade: '1st Grade', capacity: 45, currentEnrollment: 45, status: 'full' },
    { grade: '2nd Grade', capacity: 45, currentEnrollment: 42, status: 'open' },
    { grade: '3rd Grade', capacity: 45, currentEnrollment: 39, status: 'open' },
    { grade: '4th Grade', capacity: 45, currentEnrollment: 43, status: 'open' },
    { grade: '5th Grade', capacity: 45, currentEnrollment: 45, status: 'full' },
    { grade: '6th Grade', capacity: 50, currentEnrollment: 47, status: 'open' },
    { grade: '7th Grade', capacity: 50, currentEnrollment: 48, status: 'open' },
    { grade: '8th Grade', capacity: 50, currentEnrollment: 50, status: 'full' },
  ]);

  const handleSave = () => {
    // TODO: API call to save application settings
    setSnackbar({ open: true, message: 'Application settings saved successfully!', severity: 'success' });
  };

  const toggleGradeStatus = (index: number) => {
    const updated = [...gradeSettings];
    updated[index].status = updated[index].status === 'open' ? 'closed' : 'open';
    setGradeSettings(updated);
  };

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Application Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage student application process and enrollment settings
        </Typography>
      </Box>

      {/* Application Status */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6">Application Status</Typography>
            <Typography variant="body2" color="text.secondary">
              Control whether applications are being accepted
            </Typography>
          </Box>
          <Chip
            label={applicationSettings.acceptingApplications ? 'ACCEPTING APPLICATIONS' : 'APPLICATIONS CLOSED'}
            color={applicationSettings.acceptingApplications ? 'success' : 'error'}
            sx={{ fontWeight: 'bold', px: 2, py: 2.5 }}
          />
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={applicationSettings.acceptingApplications}
                  onChange={(e) =>
                    setApplicationSettings({ ...applicationSettings, acceptingApplications: e.target.checked })
                  }
                  color="success"
                />
              }
              label={
                <Box>
                  <Typography sx={{ fontWeight: 500 }}>Accept New Applications</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Turn off to stop accepting new applications
                  </Typography>
                </Box>
              }
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Application Timeline */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Application Timeline
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Application Deadline"
              type="date"
              value={applicationSettings.applicationDeadline}
              onChange={(e) =>
                setApplicationSettings({ ...applicationSettings, applicationDeadline: e.target.value })
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="School Year Start Date"
              type="date"
              value={applicationSettings.startDate}
              onChange={(e) => setApplicationSettings({ ...applicationSettings, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Application Requirements */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Application Requirements
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={applicationSettings.requirePayment}
                  onChange={(e) =>
                    setApplicationSettings({ ...applicationSettings, requirePayment: e.target.checked })
                  }
                />
              }
              label="Require Application Fee"
            />
            {applicationSettings.requirePayment && (
              <TextField
                fullWidth
                label="Application Fee Amount ($)"
                value={applicationSettings.applicationFee}
                onChange={(e) => setApplicationSettings({ ...applicationSettings, applicationFee: e.target.value })}
                type="number"
                sx={{ mt: 2 }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={applicationSettings.allowWaitlist}
                  onChange={(e) =>
                    setApplicationSettings({ ...applicationSettings, allowWaitlist: e.target.checked })
                  }
                />
              }
              label="Allow Waitlist"
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, ml: 4 }}>
              Students can join waitlist when grade is full
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Minimum Age"
              value={applicationSettings.minAge}
              onChange={(e) => setApplicationSettings({ ...applicationSettings, minAge: e.target.value })}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Maximum Age"
              value={applicationSettings.maxAge}
              onChange={(e) => setApplicationSettings({ ...applicationSettings, maxAge: e.target.value })}
              type="number"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Maximum Total Students"
              value={applicationSettings.maxStudents}
              onChange={(e) => setApplicationSettings({ ...applicationSettings, maxStudents: e.target.value })}
              type="number"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Required Documents */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Required Documents</Typography>
          <Button startIcon={<AddIcon />} variant="outlined" size="small">
            Add Document
          </Button>
        </Stack>
        <List>
          {requiredDocuments.map((doc, index) => (
            <ListItem
              key={index}
              sx={{
                bgcolor: index % 2 === 0 ? 'white' : '#fafafa',
                borderRadius: 1,
                mb: 0.5,
              }}
              secondaryAction={
                <IconButton edge="end" size="small" color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemIcon>
                <CheckCircleIcon color="success" />
              </ListItemIcon>
              <ListItemText primary={doc} />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Grade-Level Settings */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Grade-Level Enrollment
        </Typography>
        <Grid container spacing={2}>
          {gradeSettings.map((grade, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  border: grade.status === 'full' ? '2px solid #f44336' : '2px solid #e0e0e0',
                  bgcolor: grade.status === 'full' ? '#ffebee' : 'white',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {grade.grade}
                    </Typography>
                    <Chip
                      label={grade.status === 'open' ? 'Open' : grade.status === 'full' ? 'Full' : 'Closed'}
                      color={grade.status === 'open' ? 'success' : grade.status === 'full' ? 'error' : 'default'}
                      size="small"
                    />
                  </Stack>
                  <Stack spacing={1}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Enrollment
                      </Typography>
                      <Typography variant="body2">
                        {grade.currentEnrollment} / {grade.capacity} students
                      </Typography>
                    </Box>
                    <Box sx={{ width: '100%', bgcolor: '#e0e0e0', borderRadius: 1, height: 6 }}>
                      <Box
                        sx={{
                          width: `${(grade.currentEnrollment / grade.capacity) * 100}%`,
                          bgcolor: grade.status === 'full' ? '#f44336' : '#4caf50',
                          borderRadius: 1,
                          height: 6,
                        }}
                      />
                    </Box>
                    <Button
                      size="small"
                      variant="outlined"
                      fullWidth
                      onClick={() => toggleGradeStatus(index)}
                      sx={{ mt: 1 }}
                    >
                      {grade.status === 'open' ? 'Close Applications' : 'Open Applications'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Save Button */}
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <Button variant="outlined" size="large">
          Cancel
        </Button>
        <Button variant="contained" size="large" startIcon={<SaveIcon />} onClick={handleSave}>
          Save Changes
        </Button>
      </Stack>
    </Box>
  );
}
