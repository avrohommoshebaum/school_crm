import React, { useState, useEffect } from 'react';
import {
  Alert,
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
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Radio,
  RadioGroup,
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
  CircularProgress,
  Snackbar,
} from '@mui/material';
import {
  Assignment,
  CheckCircle,
  Edit,
  Warning,
} from '@mui/icons-material';
import api from '../../utils/api';

interface Principal {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  fullName?: string;
}

interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
  principalId?: string;
  principalName?: string;
}

interface Assignment {
  id: string;
  principalId: string;
  gradeId?: string;
  divisionId?: string;
  principalName?: string;
  gradeName?: string;
  divisionName?: string;
  isActive: boolean;
  notes?: string;
}

interface Division {
  id: string;
  name: string;
  description?: string;
  grades?: Grade[];
}

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

export default function GradeAssignments() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [divisionAssignments, setDivisionAssignments] = useState<Assignment[]>([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openDivisionDialog, setOpenDivisionDialog] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);
  const [selectedPrincipalId, setSelectedPrincipalId] = useState('');
  const [notes, setNotes] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [principalsRes, gradesRes, divisionsRes, assignmentsRes, divisionAssignmentsRes] = await Promise.all([
        api.get('/principal-assignments/principals'),
        api.get('/grades'),
        api.get('/divisions'),
        api.get('/principal-assignments'),
        api.get('/principal-assignments/divisions'),
      ]);

      setPrincipals(principalsRes.data.principals || []);
      const sortedGrades = (gradesRes.data.grades || []).sort((a: Grade, b: Grade) => 
        (a.level || 0) - (b.level || 0)
      );
      setGrades(sortedGrades);
      setDivisions(divisionsRes.data.divisions || []);
      setAssignments(assignmentsRes.data.assignments || []);
      setDivisionAssignments(divisionAssignmentsRes.data.assignments || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getGradeAssignments = (gradeId: string) => {
    return assignments.filter(a => a.gradeId === gradeId && a.isActive);
  };

  const getPrincipalName = (principalId: string) => {
    const principal = principals.find(p => p.id === principalId);
    return principal ? `${principal.firstName} ${principal.lastName}` : 'Unknown';
  };

  const unassignedGrades = grades.filter((grade) => {
    const gradeAssignments = getGradeAssignments(grade.id);
    return gradeAssignments.length === 0;
  }).length;

  const handleOpenDialog = (grade: Grade) => {
    setSelectedGrade(grade);
    const gradeAssignments = getGradeAssignments(grade.id);
    // For now, we'll just assign one principal per grade (can be extended later)
    setSelectedPrincipalId(gradeAssignments[0]?.principalId || '');
    setNotes(gradeAssignments[0]?.notes || '');
    setOpenAssignDialog(true);
  };

  const handleAssign = async () => {
    if (!selectedGrade || !selectedPrincipalId) {
      showSnackbar('Please select a principal', 'error');
      return;
    }

    try {
      const existingAssignment = assignments.find(
        a => a.gradeId === selectedGrade.id && a.principalId === selectedPrincipalId && a.isActive
      );

      if (existingAssignment) {
        // Update existing assignment
        await api.put(`/principal-assignments/${existingAssignment.id}`, {
          notes,
          isActive: true,
        });
        showSnackbar('Assignment updated successfully', 'success');
      } else {
        // Create new assignment
        await api.post('/principal-assignments', {
          principalId: selectedPrincipalId,
          gradeId: selectedGrade.id,
          notes,
        });
        showSnackbar('Assignment created successfully', 'success');
      }

      setOpenAssignDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving assignment:', error);
      showSnackbar(error?.response?.data?.message || 'Failed to save assignment', 'error');
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await api.delete(`/principal-assignments/${assignmentId}`);
      showSnackbar('Assignment removed successfully', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error removing assignment:', error);
      showSnackbar(error?.response?.data?.message || 'Failed to remove assignment', 'error');
    }
  };

  const getDivisionAssignments = (divisionId: string) => {
    return divisionAssignments.filter(a => a.divisionId === divisionId && a.isActive);
  };

  const unassignedDivisions = divisions.filter((division) => {
    const divisionAssignments = getDivisionAssignments(division.id);
    return divisionAssignments.length === 0;
  }).length;

  const handleOpenDivisionDialog = (division: Division) => {
    setSelectedDivision(division);
    const divisionAssignments = getDivisionAssignments(division.id);
    setSelectedPrincipalId(divisionAssignments[0]?.principalId || '');
    setNotes(divisionAssignments[0]?.notes || '');
    setOpenDivisionDialog(true);
  };

  const handleAssignDivision = async () => {
    if (!selectedDivision || !selectedPrincipalId) {
      showSnackbar('Please select a principal', 'error');
      return;
    }

    try {
      const existingAssignment = divisionAssignments.find(
        a => a.divisionId === selectedDivision.id && a.principalId === selectedPrincipalId && a.isActive
      );

      if (existingAssignment) {
        await api.put(`/principal-assignments/divisions/${existingAssignment.id}`, {
          notes,
          isActive: true,
        });
        showSnackbar('Division assignment updated successfully', 'success');
      } else {
        await api.post('/principal-assignments/divisions', {
          principalId: selectedPrincipalId,
          divisionId: selectedDivision.id,
          notes,
        });
        showSnackbar('Division assignment created successfully', 'success');
      }

      setOpenDivisionDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving division assignment:', error);
      showSnackbar(error?.response?.data?.message || 'Failed to save division assignment', 'error');
    }
  };

  const handleRemoveDivisionAssignment = async (assignmentId: string) => {
    try {
      await api.delete(`/principal-assignments/divisions/${assignmentId}`);
      showSnackbar('Division assignment removed successfully', 'success');
      loadData();
    } catch (error: any) {
      console.error('Error removing division assignment:', error);
      showSnackbar(error?.response?.data?.message || 'Failed to remove division assignment', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Grade Assignments
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Assign principals to grade levels
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Alert */}
          <Box sx={{ mb: 3 }}>
            <Alert
              severity={unassignedGrades > 0 ? 'warning' : 'success'}
              icon={unassignedGrades > 0 ? <Warning /> : <CheckCircle />}
            >
              {unassignedGrades > 0
                ? `${unassignedGrades} grade(s) need principal assignment`
                : 'All grades have principals assigned'}
            </Alert>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Grade Assignments" />
              <Tab label="Division Assignments" />
              <Tab label="Principal Overview" />
            </Tabs>
          </Box>

          {/* Grade Assignments Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={2}>
              {grades.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No grades found. Create grades in Grade Management to get started.
                  </Alert>
                </Grid>
              ) : (
                grades.map((grade) => {
                  const gradeAssignments = getGradeAssignments(grade.id);
                  const assignedPrincipal = gradeAssignments.length > 0 
                    ? principals.find(p => p.id === gradeAssignments[0].principalId)
                    : null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={grade.id}>
                      <Card
                        sx={{
                          border: assignedPrincipal ? '1px solid #e0e0e0' : '2px dashed #ccc',
                          height: '100%',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {grade.name}
                            </Typography>
                            {assignedPrincipal ? (
                              <Chip label="Assigned" size="small" color="success" />
                            ) : (
                              <Chip label="Unassigned" size="small" color="warning" />
                            )}
                          </Box>

                          {assignedPrincipal ? (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Assigned Principal:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#667eea' }}>
                                  {assignedPrincipal.firstName[0]}{assignedPrincipal.lastName[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {assignedPrincipal.firstName} {assignedPrincipal.lastName}
                                  </Typography>
                                  {assignedPrincipal.title && (
                                    <Typography variant="caption" color="text.secondary">
                                      {assignedPrincipal.title}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              {gradeAssignments[0]?.notes && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  Notes: {gradeAssignments[0].notes}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              No principal assigned
                            </Typography>
                          )}

                          <Button
                            fullWidth
                            variant={assignedPrincipal ? 'outlined' : 'contained'}
                            startIcon={assignedPrincipal ? <Edit /> : <Assignment />}
                            onClick={() => handleOpenDialog(grade)}
                          >
                            {assignedPrincipal ? 'Change Assignment' : 'Assign Principal'}
                          </Button>

                          {assignedPrincipal && gradeAssignments.length > 0 && (
                            <Button
                              fullWidth
                              variant="text"
                              color="error"
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => handleRemoveAssignment(gradeAssignments[0].id)}
                            >
                              Remove Assignment
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </TabPanel>

          {/* Division Assignments Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <Alert
                severity={unassignedDivisions > 0 ? 'warning' : 'success'}
                icon={unassignedDivisions > 0 ? <Warning /> : <CheckCircle />}
              >
                {unassignedDivisions > 0
                  ? `${unassignedDivisions} division(s) need principal assignment`
                  : 'All divisions have principals assigned'}
              </Alert>
            </Box>
            <Grid container spacing={2}>
              {divisions.length === 0 ? (
                <Grid item xs={12}>
                  <Alert severity="info">
                    No divisions found. Create divisions in Division Management to get started.
                  </Alert>
                </Grid>
              ) : (
                divisions.map((division) => {
                  const divisionAssignments = getDivisionAssignments(division.id);
                  const assignedPrincipal = divisionAssignments.length > 0 
                    ? principals.find(p => p.id === divisionAssignments[0].principalId)
                    : null;
                  
                  return (
                    <Grid item xs={12} sm={6} md={4} key={division.id}>
                      <Card
                        sx={{
                          border: assignedPrincipal ? '1px solid #e0e0e0' : '2px dashed #ccc',
                          height: '100%',
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {division.name}
                            </Typography>
                            {assignedPrincipal ? (
                              <Chip label="Assigned" size="small" color="success" />
                            ) : (
                              <Chip label="Unassigned" size="small" color="warning" />
                            )}
                          </Box>

                          {division.grades && division.grades.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                Grades:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {division.grades.map((grade) => (
                                  <Chip key={grade.id} label={grade.name} size="small" />
                                ))}
                              </Box>
                            </Box>
                          )}

                          {assignedPrincipal ? (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Assigned Principal:
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: '#667eea' }}>
                                  {assignedPrincipal.firstName[0]}{assignedPrincipal.lastName[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {assignedPrincipal.firstName} {assignedPrincipal.lastName}
                                  </Typography>
                                  {assignedPrincipal.title && (
                                    <Typography variant="caption" color="text.secondary">
                                      {assignedPrincipal.title}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>
                              {divisionAssignments[0]?.notes && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                  Notes: {divisionAssignments[0].notes}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              No principal assigned
                            </Typography>
                          )}

                          <Button
                            fullWidth
                            variant={assignedPrincipal ? 'outlined' : 'contained'}
                            startIcon={assignedPrincipal ? <Edit /> : <Assignment />}
                            onClick={() => handleOpenDivisionDialog(division)}
                          >
                            {assignedPrincipal ? 'Change Assignment' : 'Assign Principal'}
                          </Button>

                          {assignedPrincipal && divisionAssignments.length > 0 && (
                            <Button
                              fullWidth
                              variant="text"
                              color="error"
                              size="small"
                              sx={{ mt: 1 }}
                              onClick={() => handleRemoveDivisionAssignment(divisionAssignments[0].id)}
                            >
                              Remove Assignment
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })
              )}
            </Grid>
          </TabPanel>

          {/* Principal Overview Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Principal</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned Grades</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Assigned Divisions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {principals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No principals found. Principals must be added as staff members first.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    principals.map((principal) => {
                      const principalAssignments = assignments.filter(
                        a => a.principalId === principal.id && a.isActive
                      );
                      const assignedGrades = principalAssignments
                        .map(a => grades.find(g => g.id === a.gradeId))
                        .filter(Boolean) as Grade[];
                      
                      const principalDivisionAssignments = divisionAssignments.filter(
                        a => a.principalId === principal.id && a.isActive
                      );
                      const assignedDivisions = principalDivisionAssignments
                        .map(a => divisions.find(d => d.id === a.divisionId))
                        .filter(Boolean) as Division[];
                      
                      return (
                        <TableRow key={principal.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#667eea' }}>
                                {principal.firstName[0]}{principal.lastName[0]}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {principal.firstName} {principal.lastName}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{principal.title || '—'}</TableCell>
                          <TableCell>
                            {assignedGrades.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {assignedGrades.map((grade) => (
                                  <Chip 
                                    key={grade.id} 
                                    label={grade.name} 
                                    size="small"
                                    sx={{ bgcolor: '#e3f2fd' }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No grade assignments
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            {assignedDivisions.length > 0 ? (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {assignedDivisions.map((division) => (
                                  <Chip 
                                    key={division.id} 
                                    label={division.name} 
                                    size="small"
                                    sx={{ bgcolor: '#f3e5f5' }}
                                  />
                                ))}
                              </Box>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                No division assignments
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Assign Principal to Grade Dialog */}
          <Dialog open={openAssignDialog} onClose={() => setOpenAssignDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedGrade ? `Assign Principal to ${selectedGrade.name}` : 'Assign Principal'}
            </DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Principal</InputLabel>
                <Select
                  value={selectedPrincipalId}
                  onChange={(e) => setSelectedPrincipalId(e.target.value)}
                  input={<OutlinedInput label="Select Principal" />}
                >
                  <MenuItem value="">
                    <em>None (Remove Assignment)</em>
                  </MenuItem>
                  {principals.map((principal) => (
                    <MenuItem key={principal.id} value={principal.id}>
                      {principal.firstName} {principal.lastName}
                      {principal.title && ` - ${principal.title}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Add any notes about this assignment..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
              <Button onClick={handleAssign} variant="contained" color="primary">
                {selectedPrincipalId ? 'Save Assignment' : 'Remove Assignment'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Assign Principal to Division Dialog */}
          <Dialog open={openDivisionDialog} onClose={() => setOpenDivisionDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedDivision ? `Assign Principal to ${selectedDivision.name}` : 'Assign Principal'}
            </DialogTitle>
            <DialogContent>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Principal</InputLabel>
                <Select
                  value={selectedPrincipalId}
                  onChange={(e) => setSelectedPrincipalId(e.target.value)}
                  input={<OutlinedInput label="Select Principal" />}
                >
                  <MenuItem value="">
                    <em>None (Remove Assignment)</em>
                  </MenuItem>
                  {principals.map((principal) => (
                    <MenuItem key={principal.id} value={principal.id}>
                      {principal.firstName} {principal.lastName}
                      {principal.title && ` - ${principal.title}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{ mt: 2 }}
                placeholder="Add any notes about this assignment..."
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDivisionDialog(false)}>Cancel</Button>
              <Button onClick={handleAssignDivision} variant="contained" color="primary">
                {selectedPrincipalId ? 'Save Assignment' : 'Remove Assignment'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
}
