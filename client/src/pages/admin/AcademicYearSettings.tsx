import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Chip,
  Alert,
  Snackbar,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function AcademicYearSettings() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [addTermDialog, setAddTermDialog] = useState(false);
  
  const [academicYear, setAcademicYear] = useState({
    currentYear: '2024-2025',
    startDate: '2024-09-03',
    endDate: '2025-06-20',
    totalDays: '180',
  });

  const [terms, setTerms] = useState([
    { name: 'First Term', startDate: '2024-09-03', endDate: '2024-12-20', status: 'active' },
    { name: 'Winter Break', startDate: '2024-12-21', endDate: '2025-01-05', status: 'break' },
    { name: 'Second Term', startDate: '2025-01-06', endDate: '2025-03-28', status: 'upcoming' },
    { name: 'Spring Break', startDate: '2025-03-29', endDate: '2025-04-06', status: 'upcoming' },
    { name: 'Third Term', startDate: '2025-04-07', endDate: '2025-06-20', status: 'upcoming' },
  ]);

  const [holidays, setHolidays] = useState([
    { name: 'Rosh Hashanah', date: '2024-10-03', type: 'jewish' },
    { name: 'Yom Kippur', date: '2024-10-12', type: 'jewish' },
    { name: 'Sukkot', date: '2024-10-17', type: 'jewish' },
    { name: 'Thanksgiving', date: '2024-11-28', type: 'secular' },
    { name: 'Chanukah', date: '2024-12-26', type: 'jewish' },
    { name: 'Purim', date: '2025-03-14', type: 'jewish' },
    { name: 'Pesach', date: '2025-04-13', type: 'jewish' },
    { name: 'Shavuot', date: '2025-06-02', type: 'jewish' },
  ]);

  const handleSave = () => {
    // TODO: API call to save academic year settings
    setSnackbar({ open: true, message: 'Academic year settings saved successfully!', severity: 'success' });
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
          Academic Year Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Configure academic year, terms, and holidays
        </Typography>
      </Box>

      {/* Current Academic Year */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6">Current Academic Year</Typography>
            <Typography variant="body2" color="text.secondary">
              Configure the current school year
            </Typography>
          </Box>
          <Chip label={academicYear.currentYear} color="primary" sx={{ fontWeight: 'bold', px: 2, py: 2.5 }} />
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Academic Year"
              value={academicYear.currentYear}
              onChange={(e) => setAcademicYear({ ...academicYear, currentYear: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={academicYear.startDate}
              onChange={(e) => setAcademicYear({ ...academicYear, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={academicYear.endDate}
              onChange={(e) => setAcademicYear({ ...academicYear, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Total School Days"
              value={academicYear.totalDays}
              onChange={(e) => setAcademicYear({ ...academicYear, totalDays: e.target.value })}
              type="number"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Terms & Semesters */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Terms & Semesters</Typography>
          <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setAddTermDialog(true)}>
            Add Term
          </Button>
        </Stack>

        <Grid container spacing={2}>
          {terms.map((term, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  border: term.status === 'active' ? '2px solid #1976d2' : '2px solid #e0e0e0',
                  bgcolor: term.status === 'break' ? '#fff3e0' : 'white',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {term.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(term.startDate).toLocaleDateString()} -{' '}
                        {new Date(term.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={0.5}>
                      <Chip
                        label={
                          term.status === 'active'
                            ? 'Active'
                            : term.status === 'break'
                            ? 'Break'
                            : 'Upcoming'
                        }
                        color={
                          term.status === 'active'
                            ? 'primary'
                            : term.status === 'break'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </Stack>
                  </Stack>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Holidays & Breaks */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6">Holidays & School Closures</Typography>
          <Button startIcon={<AddIcon />} variant="outlined">
            Add Holiday
          </Button>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 2 }}>
              Jewish Holidays
            </Typography>
            <List sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 1 }}>
              {holidays
                .filter((h) => h.type === 'jewish')
                .map((holiday, index) => (
                  <Box key={index}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <CalendarMonthIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={holiday.name}
                        secondary={new Date(holiday.date).toLocaleDateString()}
                      />
                    </ListItem>
                    {index < holidays.filter((h) => h.type === 'jewish').length - 1 && <Divider />}
                  </Box>
                ))}
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="secondary" sx={{ mb: 2 }}>
              Secular Holidays
            </Typography>
            <List sx={{ bgcolor: '#f5f5f5', borderRadius: 2, p: 1 }}>
              {holidays
                .filter((h) => h.type === 'secular')
                .map((holiday, index) => (
                  <Box key={index}>
                    <ListItem
                      secondaryAction={
                        <IconButton edge="end" size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <CalendarMonthIcon sx={{ mr: 2, color: 'secondary.main' }} />
                      <ListItemText
                        primary={holiday.name}
                        secondary={new Date(holiday.date).toLocaleDateString()}
                      />
                    </ListItem>
                    {index < holidays.filter((h) => h.type === 'secular').length - 1 && <Divider />}
                  </Box>
                ))}
            </List>
          </Grid>
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

      {/* Add Term Dialog */}
      <Dialog open={addTermDialog} onClose={() => setAddTermDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Term</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField fullWidth label="Term Name" placeholder="e.g., Fourth Term" />
            <TextField fullWidth label="Start Date" type="date" InputLabelProps={{ shrink: true }} />
            <TextField fullWidth label="End Date" type="date" InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setAddTermDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddTermDialog(false)}>
            Add Term
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
