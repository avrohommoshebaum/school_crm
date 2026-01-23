import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { Add, Edit, Delete, School } from '@mui/icons-material';
import api from '../../utils/api';

interface Division {
  id: string;
  name: string;
  description?: string;
  grades?: Grade[];
  gradeCount?: number;
}

interface Grade {
  id: string;
  name: string;
  level: number;
}

export default function DivisionManagement() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Division | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    selectedGrades: [] as string[],
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; division: Division | null }>({
    open: false,
    division: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [divisionsRes, gradesRes] = await Promise.all([
        api.get('/divisions'),
        api.get('/grades'),
      ]);

      setDivisions(divisionsRes.data.divisions || []);
      const sortedGrades = (gradesRes.data.grades || []).sort((a: Grade, b: Grade) => 
        (a.level || 0) - (b.level || 0)
      );
      setGrades(sortedGrades);
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

  const handleOpenDialog = (division?: Division) => {
    if (division) {
      setEditingDivision(division);
      setFormData({
        name: division.name || '',
        description: division.description || '',
        selectedGrades: division.grades?.map(g => g.id) || [],
      });
    } else {
      setEditingDivision(null);
      setFormData({
        name: '',
        description: '',
        selectedGrades: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDivision(null);
    setFormData({
      name: '',
      description: '',
      selectedGrades: [],
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar('Division name is required', 'error');
        return;
      }

      const divisionData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        gradeIds: formData.selectedGrades,
      };

      if (editingDivision) {
        await api.put(`/divisions/${editingDivision.id}`, divisionData);
        showSnackbar('Division updated successfully', 'success');
      } else {
        await api.post('/divisions', divisionData);
        showSnackbar('Division created successfully', 'success');
      }

      handleCloseDialog();
      loadData();
    } catch (error: any) {
      console.error('Error saving division:', error);
      showSnackbar(
        error?.response?.data?.message || 'Failed to save division',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.division) return;

    try {
      await api.delete(`/divisions/${deleteConfirm.division.id}`);
      showSnackbar('Division deleted successfully', 'success');
      setDeleteConfirm({ open: false, division: null });
      loadData();
    } catch (error: any) {
      console.error('Error deleting division:', error);
      showSnackbar(
        error?.response?.data?.message || 'Failed to delete division',
        'error'
      );
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Division Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage divisions by grouping grades together
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            },
          }}
        >
          Add Division
        </Button>
      </Box>

      {/* Divisions Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Grades</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {divisions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No divisions found. Create your first division to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              divisions.map((division) => (
                <TableRow key={division.id} hover>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {division.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {division.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {division.grades && division.grades.length > 0 ? (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {division.grades.map((grade) => (
                          <Chip
                            key={grade.id}
                            label={grade.name}
                            size="small"
                            icon={<School />}
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No grades assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(division)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm({ open: true, division })}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingDivision ? 'Edit Division' : 'Create New Division'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Division Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Primary Division, Middle School Division"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Optional description for this division"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Grades</InputLabel>
              <Select
                multiple
                value={formData.selectedGrades}
                onChange={(e) => setFormData({ ...formData, selectedGrades: e.target.value as string[] })}
                input={<OutlinedInput label="Select Grades" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((gradeId) => {
                      const grade = grades.find(g => g.id === gradeId);
                      return grade ? (
                        <Chip key={gradeId} label={grade.name} size="small" />
                      ) : null;
                    })}
                  </Box>
                )}
              >
                {grades.map((grade) => (
                  <MenuItem key={grade.id} value={grade.id}>
                    {grade.name} (Level {grade.level})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingDivision ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, division: null })}>
        <DialogTitle>Delete Division</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{deleteConfirm.division?.name}</strong>?
            This action cannot be undone.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Note: This will remove the division but will not delete the grades or principal assignments.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, division: null })}>
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
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

