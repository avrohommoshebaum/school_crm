import { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Flag as FlagIcon } from '@mui/icons-material';
import api from '../../../utils/api';

export default function FlaggedStudentsWidget() {
  const [flaggedCount, setFlaggedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFlaggedStudents = async () => {
      try {
        setLoading(true);
        // Get flagged students from principal center
        try {
          const response = await api.get('/principal/flagged-students');
          const students = response.data.students || [];
          setFlaggedCount(students.length);
        } catch (err: any) {
          // If endpoint doesn't exist, default to 0
          if (err.response?.status === 404) {
            setFlaggedCount(0);
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching flagged students:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchFlaggedStudents();
  }, []);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Flagged Students
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
                {flaggedCount ?? 0}
              </Typography>
              <Typography variant="caption" color="error.main">
                Needs attention
              </Typography>
            </>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlagIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}
