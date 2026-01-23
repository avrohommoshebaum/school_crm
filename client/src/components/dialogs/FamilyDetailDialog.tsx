import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Divider,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../utils/api";

interface FamilyDetailDialogProps {
  open: boolean;
  familyId: string;
  onClose: () => void;
}

interface FamilyDetail {
  id: string;
  familyName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  notes?: string;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    gradeName?: string;
    className?: string;
  }>;
  parents?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    relationship?: string;
    phone?: string;
    email?: string;
  }>;
}

export default function FamilyDetailDialog({
  open,
  familyId,
  onClose,
}: FamilyDetailDialogProps) {
  const [family, setFamily] = useState<FamilyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && familyId) {
      loadFamily();
    }
  }, [open, familyId]);

  const loadFamily = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/families/${familyId}`);
      setFamily(response.data.family);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load family details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Family Details
          </Typography>
          <Button onClick={onClose} size="small">
            <CloseIcon />
          </Button>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : family ? (
          <Stack spacing={3}>
            {/* Family Information */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Family Information
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Family Name
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {family.familyName}
                  </Typography>
                </Grid>
                {family.address && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Address
                    </Typography>
                    <Typography variant="body1">{family.address}</Typography>
                  </Grid>
                )}
                {(family.city || family.state || family.zipCode) && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      City, State, Zip
                    </Typography>
                    <Typography variant="body1">
                      {[family.city, family.state, family.zipCode]
                        .filter(Boolean)
                        .join(", ")}
                    </Typography>
                  </Grid>
                )}
                {family.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{family.phone}</Typography>
                  </Grid>
                )}
                {family.email && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{family.email}</Typography>
                  </Grid>
                )}
                {family.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{family.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Students */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Students ({family.students?.length || 0})
              </Typography>
              <Divider sx={{ my: 2 }} />
              {family.students && family.students.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {family.students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>
                            {student.gradeName ? (
                              <Chip label={student.gradeName} size="small" />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {student.className ? (
                              <Chip label={student.className} size="small" />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No students in this family
                </Typography>
              )}
            </Paper>

            {/* Parents */}
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Parents/Guardians ({family.parents?.length || 0})
              </Typography>
              <Divider sx={{ my: 2 }} />
              {family.parents && family.parents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Relationship</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {family.parents.map((parent) => (
                        <TableRow key={parent.id}>
                          <TableCell>
                            {parent.firstName} {parent.lastName}
                          </TableCell>
                          <TableCell>
                            {parent.relationship ? (
                              <Chip label={parent.relationship} size="small" />
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>{parent.phone || "—"}</TableCell>
                          <TableCell>{parent.email || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No parents/guardians in this family
                </Typography>
              )}
            </Paper>
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
