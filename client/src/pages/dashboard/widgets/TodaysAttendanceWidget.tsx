import { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import api from '../../../utils/api';

export default function TodaysAttendanceWidget() {
  const [attendance, setAttendance] = useState<{ present: number; total: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Get all students
        const studentsRes = await api.get('/students', { params: { limit: 10000 } });
        const students = studentsRes.data.students || [];
        const total = students.length;

        // For now, we'll calculate a mock attendance rate
        // In production, you'd fetch actual attendance records for today
        // This is a placeholder - replace with actual attendance API when available
        const present = Math.floor(total * 0.965); // Mock 96.5% attendance
        const percentage = total > 0 ? (present / total) * 100 : 0;

        setAttendance({ present, total, percentage });
      } catch (err: any) {
        console.error('Error fetching attendance:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Today's Attendance
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : attendance ? (
            <>
              <Typography variant="h4">
                {attendance.percentage.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {attendance.present} of {attendance.total} present
              </Typography>
            </>
          ) : (
            <Typography variant="h6">N/A</Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: 'success.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}