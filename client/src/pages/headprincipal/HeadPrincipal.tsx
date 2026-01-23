/**
 * Head Principal Management Page
 * Allows assigning principals to grades (admin/headPrincipal permission required)
 */

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { hasPermission } from "../../utils/permissions";

type Principal = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  fullName: string;
};

type Grade = {
  id: string;
  name: string;
  level: number;
  description?: string;
};

type Assignment = {
  id: string;
  principalId: string;
  gradeId: string;
  principalFirstName: string;
  principalLastName: string;
  principalEmail?: string;
  gradeName: string;
  gradeLevel: number;
  assignedAt: string;
  isActive: boolean;
  notes?: string;
};

export default function HeadPrincipal() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [principals, setPrincipals] = useState<Principal[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" as "success" | "error" });

  const [formData, setFormData] = useState({
    principalId: "",
    gradeId: "",
    notes: "",
  });

  const hasLoadedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Check permissions
  const canManage = hasPermission(user, "headPrincipal", "view") || 
                    user?.roles?.some((r: any) => r.name === "admin");

  useEffect(() => {
    if (!canManage) return;

    const loadData = async () => {
      if (hasLoadedRef.current || isFetchingRef.current) return;
      hasLoadedRef.current = true;
      isFetchingRef.current = true;

      try {
        setLoading(true);
        const [assignmentsRes, principalsRes, gradesRes] = await Promise.all([
          api.get("/principal-assignments"),
          api.get("/principal-assignments/principals"),
          api.get("/grades"),
        ]);

        setAssignments(assignmentsRes.data.assignments || []);
        setPrincipals(principalsRes.data.principals || []);
        setGrades(gradesRes.data.grades || []);
        setError(null);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setError(err?.response?.data?.message || "Failed to load data");
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    };

    loadData();
  }, [canManage]);

  const handleOpenDialog = (assignment?: Assignment) => {
    if (assignment) {
      setEditingAssignment(assignment);
      setFormData({
        principalId: assignment.principalId,
        gradeId: assignment.gradeId,
        notes: assignment.notes || "",
      });
    } else {
      setEditingAssignment(null);
      setFormData({
        principalId: "",
        gradeId: "",
        notes: "",
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingAssignment(null);
    setFormData({
      principalId: "",
      gradeId: "",
      notes: "",
    });
  };

  const handleSave = async () => {
    try {
      if (editingAssignment) {
        // Update
        await api.put(`/principal-assignments/${editingAssignment.id}`, {
          isActive: true,
          notes: formData.notes,
        });
        setSnackbar({ open: true, message: "Assignment updated successfully", severity: "success" });
      } else {
        // Create
        await api.post("/principal-assignments", {
          principalId: formData.principalId,
          gradeId: formData.gradeId,
          notes: formData.notes,
        });
        setSnackbar({ open: true, message: "Assignment created successfully", severity: "success" });
      }

      handleCloseDialog();
      
      // Reload data
      hasLoadedRef.current = false;
      const [assignmentsRes] = await Promise.all([
        api.get("/principal-assignments"),
      ]);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (err: any) {
      console.error("Error saving assignment:", err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to save assignment",
        severity: "error",
      });
    }
  };

  const handleDelete = async (assignmentId: string) => {
    if (!window.confirm("Are you sure you want to remove this assignment?")) return;

    try {
      await api.delete(`/principal-assignments/${assignmentId}`);
      setSnackbar({ open: true, message: "Assignment removed successfully", severity: "success" });
      
      // Reload data
      hasLoadedRef.current = false;
      const [assignmentsRes] = await Promise.all([
        api.get("/principal-assignments"),
      ]);
      setAssignments(assignmentsRes.data.assignments || []);
    } catch (err: any) {
      console.error("Error deleting assignment:", err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.message || "Failed to remove assignment",
        severity: "error",
      });
    }
  };

  if (!canManage) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">You do not have permission to access this page.</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Head Principal Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Assign principals to grades
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Assign Principal
          </Button>
        </Stack>

        {assignments.length === 0 ? (
          <Alert severity="info">No principal assignments found. Create one to get started.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>Principal</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Grade</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Assigned</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Notes</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {assignment.principalFirstName} {assignment.principalLastName}
                          </Typography>
                          {assignment.principalEmail && (
                            <Typography variant="caption" color="text.secondary">
                              {assignment.principalEmail}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <SchoolIcon fontSize="small" color="action" />
                        <Typography variant="body2">{assignment.gradeName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(assignment.assignedAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {assignment.notes || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenDialog(assignment)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingAssignment ? "Edit Assignment" : "Assign Principal to Grade"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Principal</InputLabel>
              <Select
                value={formData.principalId}
                label="Principal"
                onChange={(e) => setFormData({ ...formData, principalId: e.target.value })}
                disabled={!!editingAssignment}
              >
                {principals.map((principal) => (
                  <MenuItem key={principal.id} value={principal.id}>
                    {principal.fullName}
                    {principal.email && ` (${principal.email})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Grade</InputLabel>
              <Select
                value={formData.gradeId}
                label="Grade"
                onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                disabled={!!editingAssignment}
              >
                {grades
                  .sort((a, b) => (a.level || 0) - (b.level || 0))
                  .map((grade) => (
                    <MenuItem key={grade.id} value={grade.id}>
                      {grade.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notes (optional)"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.principalId || !formData.gradeId}
          >
            {editingAssignment ? "Update" : "Assign"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

