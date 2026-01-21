import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip, Box, CircularProgress } from '@mui/material';
import api from '../../../utils/api';

interface AbsentStudent {
  id: string;
  name: string;
  grade?: string;
  reason?: string;
}

export default function AbsentStudentsWidget() {
  const [absentStudents, setAbsentStudents] = useState<AbsentStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAbsentStudents = async () => {
      try {
        setLoading(true);
        // Note: This endpoint may need to be implemented
        // For now, using a placeholder
        try {
          const today = new Date().toISOString().split('T')[0];
          const response = await api.get('/attendance/absent', { params: { date: today } });
          const students = response.data.students || [];
          setAbsentStudents(students.slice(0, 5)); // Limit to 5 for widget
        } catch (err: any) {
          if (err.response?.status === 404) {
            setAbsentStudents([]);
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching absent students:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchAbsentStudents();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Absent Students Today
        </Typography>
        <Chip label={absentStudents.length} color="error" size="small" />
      </Box>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {absentStudents.length === 0 ? (
          <ListItem>
            <ListItemText primary="No absent students today" secondary="All students are present" />
          </ListItem>
        ) : (
          absentStudents.map((student) => (
            <ListItem key={student.id} sx={{ px: 0, py: 1 }}>
              <ListItemText
                primary={student.name}
                secondary={
                  <>
                    {student.grade && (
                      <>
                        <Typography variant="caption" color="text.secondary" component="span">
                          {student.grade}
                        </Typography>
                        {student.reason && (
                          <>
                            <Typography variant="caption" sx={{ color: 'text.disabled', mx: 0.5 }} component="span">•</Typography>
                            <Typography variant="caption" color="text.secondary" component="span">
                              {student.reason}
                            </Typography>
                          </>
                        )}
                      </>
                    )}
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}