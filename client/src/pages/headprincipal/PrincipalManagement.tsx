import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import {
  Delete,
  Edit,
  PersonAdd,
  Visibility,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface Principal {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  fullName?: string;
}

interface Grade {
  id: string;
  name: string;
  level: number;
}

interface Assignment {
  id: string;
  principalId: string;
  gradeId?: string;
  divisionId?: string;
  isActive: boolean;
  notes?: string;
}

interface Division {
  id: string;
  name: string;
  description?: string;
}

export default function PrincipalManagement() {
  const navigate = useNavigate();
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [divisionAssignments, setDivisionAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [viewDialog, setViewDialog] = useState<{ open: boolean; principal: Principal | null }>({
    open: false,
    principal: null,
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [principalsRes, gradesRes, divisionsRes, assignmentsRes, divisionAssignmentsRes] = await Promise.all([
        api.get('/principal-assignments/principals'),
        api.get('/grades'),
        api.get('/divisions'),
        api.get('/principal-assignments'),
        api.get('/principal-assignments/divisions'),
      ]);

      setPrincipals(principalsRes.data.principals || []);
      setGrades(gradesRes.data.grades || []);
      setDivisions(divisionsRes.data.divisions || []);
      setAssignments(assignmentsRes.data.assignments || []);
      setDivisionAssignments(divisionAssignmentsRes.data.assignments || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err?.response?.data?.message || 'Failed to load principals data');
      showSnackbar('Failed to load principals data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPrincipalAssignments = (principalId: string) => {
    return assignments.filter(a => a.principalId === principalId && a.isActive);
  };

  const getAssignedGrades = (principalId: string) => {
    const principalAssignments = getPrincipalAssignments(principalId);
    return principalAssignments
      .map(a => grades.find(g => g.id === a.gradeId))
      .filter(Boolean) as Grade[];
  };

  const getAssignedDivisions = (principalId: string) => {
    const principalDivisionAssignments = divisionAssignments.filter(
      a => a.principalId === principalId && a.isActive
    );
    return principalDivisionAssignments
      .map(a => divisions.find(d => d.id === a.divisionId))
      .filter(Boolean) as Division[];
  };

  const handleViewPrincipal = (principal: Principal) => {
    setViewDialog({ open: true, principal });
  };

  const handleEditPrincipal = (principal: Principal) => {
    // Navigate to staff management or open edit dialog
    navigate(`/admin/staff/${principal.id}`);
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Are you sure you want to remove this assignment?')) {
      return;
    }

    try {
      await api.delete(`/principal-assignments/${assignmentId}`);
      showSnackbar('Assignment removed successfully', 'success');
      loadData();
    } catch (err: any) {
      console.error('Error removing assignment:', err);
      showSnackbar(err?.response?.data?.message || 'Failed to remove assignment', 'error');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error && principals.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Principal Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage principals and their grade assignments
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<PersonAdd />}
          onClick={() => navigate('/admin/staff')}
        >
          Add Principal
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} (Some data may be incomplete)
        </Alert>
      )}

      {/* Principals Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Principal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Assigned Grades</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {principals.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No principals found. Principals must be added as staff members with a principal position.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PersonAdd />}
                      onClick={() => navigate('/admin/staff')}
                      sx={{ mt: 2 }}
                    >
                      Go to Staff Management
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                principals.map((principal) => {
                  const assignedGrades = getAssignedGrades(principal.id);
                  const principalAssignments = getPrincipalAssignments(principal.id);

                  return (
                    <TableRow key={principal.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: '#667eea' }}>
                            {principal.firstName[0]}
                            {principal.lastName[0]}
                          </Avatar>
                          <Typography sx={{ fontWeight: 500 }}>
                            {principal.firstName} {principal.lastName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {principal.email || (
                          <Typography variant="body2" color="text.secondary">
                            No email
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {principal.title ? (
                          <Chip label={principal.title} size="small" color="primary" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignedGrades.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {assignedGrades.map((grade) => {
                              const assignment = principalAssignments.find(a => a.gradeId === grade.id);
                              return (
                                <Chip
                                  key={grade.id}
                                  label={grade.name}
                                  size="small"
                                  onDelete={() => assignment && handleDeleteAssignment(assignment.id)}
                                  sx={{ mr: 0.5 }}
                                />
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No assignments
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleViewPrincipal(principal)}
                          title="View Details"
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditPrincipal(principal)}
                          title="Edit Principal"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/principal/head-principal/grade-assignments`)}
                          title="Manage Assignments"
                        >
                          <PersonAdd />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* View Principal Dialog */}
      <Dialog open={viewDialog.open} onClose={() => setViewDialog({ open: false, principal: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Principal Details
        </DialogTitle>
        <DialogContent>
          {viewDialog.principal && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Name"
                value={`${viewDialog.principal.firstName} ${viewDialog.principal.lastName}`}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Email"
                value={viewDialog.principal.email || 'No email'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Phone"
                value={viewDialog.principal.phone || 'No phone'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Title"
                value={viewDialog.principal.title || 'No title'}
                margin="normal"
                InputProps={{ readOnly: true }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Assigned Grades:
                </Typography>
                {getAssignedGrades(viewDialog.principal.id).length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getAssignedGrades(viewDialog.principal.id).map((grade) => (
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
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Assigned Divisions:
                </Typography>
                {getAssignedDivisions(viewDialog.principal.id).length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {getAssignedDivisions(viewDialog.principal.id).map((division) => (
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
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialog({ open: false, principal: null })}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (viewDialog.principal) {
                handleEditPrincipal(viewDialog.principal);
              }
            }}
          >
            Edit Principal
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
    </Box>
  );
}
