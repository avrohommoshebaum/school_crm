import { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { Class as ClassIcon } from '@mui/icons-material';
import api from '../../../utils/api';
import useCurrentUser from '../../../hooks/useCurrentUser';

export default function MyClassesWidget() {
  const [classCount, setClassCount] = useState<number | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        // Get classes assigned to current user
        try {
          const response = await api.get('/classes', { params: { teacherId: user?.id } });
          const classes = response.data.classes || [];
          setClassCount(classes.length);
          
          // Calculate total students across all classes
          let totalStudents = 0;
          for (const cls of classes) {
            if (cls.studentCount) {
              totalStudents += cls.studentCount;
            } else if (cls.students) {
              totalStudents += cls.students.length;
            }
          }
          setStudentCount(totalStudents);
        } catch (err: any) {
          if (err.response?.status === 404) {
            setClassCount(0);
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching classes:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchClasses();
    }
  }, [user?.id]);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            My Classes
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
                {classCount ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {studentCount} total students
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
          <ClassIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}