import { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';
import api from '../../../utils/api';

export default function PendingApplicationsWidget() {
  const [pendingCount, setPendingCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Note: This endpoint may need to be implemented
        // For now, using a placeholder that returns 0 if endpoint doesn't exist
        try {
          const response = await api.get('/applications', { params: { status: 'pending' } });
          const applications = response.data.applications || [];
          setPendingCount(applications.length);
        } catch (err: any) {
          // If endpoint doesn't exist, default to 0
          if (err.response?.status === 404) {
            setPendingCount(0);
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching applications:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Pending Applications
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : (
            <>
              <Typography variant="h4">
                {pendingCount ?? 0}
              </Typography>
              <Typography variant="caption" color="warning.main">
                Needs review
              </Typography>
            </>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: 'warning.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AssignmentIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}