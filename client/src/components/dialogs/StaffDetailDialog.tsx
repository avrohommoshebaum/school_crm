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
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import api from "../../utils/api";

interface StaffDetailDialogProps {
  open: boolean;
  staffId: string;
  onClose: () => void;
}

interface StaffDetail {
  id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  positions?: Array<{
    id: string;
    positionName: string;
    startDate?: string;
    endDate?: string;
  }>;
  salaries?: Array<{
    id: string;
    amount: number;
    startDate: string;
    endDate?: string;
  }>;
}

export default function StaffDetailDialog({
  open,
  staffId,
  onClose,
}: StaffDetailDialogProps) {
  const [staff, setStaff] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && staffId) {
      loadStaff();
    }
  }, [open, staffId]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/staff/${staffId}`);
      setStaff(response.data.staff);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load staff details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Staff Details
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
        ) : staff ? (
          <Stack spacing={3}>
            {/* Staff Information */}
            <Paper sx={{ p: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                  }}
                >
                  {staff.firstName?.[0]}
                  {staff.lastName?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {staff.firstName} {staff.lastName}
                  </Typography>
                  {staff.employeeId && (
                    <Typography variant="body2" color="text.secondary">
                      ID: {staff.employeeId}
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {staff.email && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{staff.email}</Typography>
                  </Grid>
                )}
                {staff.phone && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">{staff.phone}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Employment Status
                  </Typography>
                  <Chip
                    label={staff.employmentStatus || "—"}
                    size="small"
                    color={
                      staff.employmentStatus === "active"
                        ? "success"
                        : staff.employmentStatus === "inactive"
                        ? "warning"
                        : "error"
                    }
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Positions */}
            {staff.positions && staff.positions.length > 0 && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Positions ({staff.positions.length})
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Stack spacing={1}>
                  {staff.positions.map((position) => (
                    <Box key={position.id}>
                      <Chip label={position.positionName} />
                      {position.startDate && (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          Since {new Date(position.startDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
