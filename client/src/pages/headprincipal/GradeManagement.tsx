import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
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
  Chip,
} from '@mui/material';
import { Add, Edit, Delete, School } from '@mui/icons-material';
import api from '../../utils/api';

interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function GradeManagement() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    level: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; grade: Grade | null }>({
    open: false,
    grade: null,
  });

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grades');
      const sortedGrades = (response.data.grades || []).sort((a: Grade, b: Grade) => 
        (a.level || 0) - (b.level || 0)
      );
      setGrades(sortedGrades);
    } catch (error: any) {
      console.error('Error loading grades:', error);
      showSnackbar('Failed to load grades', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (grade?: Grade) => {
    if (grade) {
      setEditingGrade(grade);
      setFormData({
        name: grade.name || '',
        level: grade.level?.toString() || '',
        description: grade.description || '',
      });
    } else {
      setEditingGrade(null);
      setFormData({
        name: '',
        level: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGrade(null);
    setFormData({
      name: '',
      level: '',
      description: '',
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.name.trim()) {
        showSnackbar('Grade name is required', 'error');
        return;
      }

      if (!formData.level || isNaN(Number(formData.level))) {
        showSnackbar('Valid grade level is required', 'error');
        return;
      }

      const gradeData = {
        name: formData.name.trim(),
        level: parseInt(formData.level),
        description: formData.description.trim() || undefined,
      };

      if (editingGrade) {
        await api.put(`/grades/${editingGrade.id}`, gradeData);
        showSnackbar('Grade updated successfully', 'success');
      } else {
        await api.post('/grades', gradeData);
        showSnackbar('Grade created successfully', 'success');
      }

      handleCloseDialog();
      loadGrades();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      showSnackbar(
        error?.response?.data?.message || 'Failed to save grade',
        'error'
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.grade) return;

    try {
      await api.delete(`/grades/${deleteConfirm.grade.id}`);
      showSnackbar('Grade deleted successfully', 'success');
      setDeleteConfirm({ open: false, grade: null });
      loadGrades();
    } catch (error: any) {
      console.error('Error deleting grade:', error);
      showSnackbar(
        error?.response?.data?.message || 'Failed to delete grade',
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
            Grade Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, edit, and manage grade levels
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
          Add Grade
        </Button>
      </Box>

      {/* Grades Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Level</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grades.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    No grades found. Create your first grade to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              grades.map((grade) => (
                <TableRow key={grade.id} hover>
                  <TableCell>
                    <Chip
                      label={grade.level}
                      color="primary"
                      size="small"
                      icon={<School />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {grade.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {grade.description || '—'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(grade)}
                      color="primary"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => setDeleteConfirm({ open: true, grade })}
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
          {editingGrade ? 'Edit Grade' : 'Create New Grade'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Grade Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
              placeholder="e.g., Kindergarten, 1st Grade"
            />
            <TextField
              fullWidth
              label="Grade Level"
              type="number"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              margin="normal"
              required
              helperText="Numeric level (0 for Kindergarten, 1 for 1st Grade, etc.)"
              inputProps={{ min: 0 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
              placeholder="Optional description for this grade level"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            {editingGrade ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false, grade: null })}>
        <DialogTitle>Delete Grade</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete <strong>{deleteConfirm.grade?.name}</strong>?
            This action cannot be undone.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Note: If this grade has associated classes or students, you may need to reassign them first.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false, grade: null })}>
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
