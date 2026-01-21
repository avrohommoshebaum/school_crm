import { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';
import api from '../../../utils/api';

export default function TotalStudentsWidget() {
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await api.get('/students', { params: { limit: 10000 } });
        const students = response.data.students || [];
        setTotalStudents(students.length);
      } catch (err: any) {
        console.error('Error fetching students:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Total Students
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
                {totalStudents ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Enrolled
              </Typography>
            </>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SchoolIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}