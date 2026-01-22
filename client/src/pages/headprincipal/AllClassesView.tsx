import React, { useState, useEffect } from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from '@mui/material';
import { Visibility, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface Class {
  id: string;
  name: string;
  gradeId?: string;
  gradeName?: string;
  roomNumber?: string;
  studentCount: number;
  teachers: Array<{
    id: string;
    firstName: string;
    lastName: string;
  }>;
}

export default function AllClassesView() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [classesRes, gradesRes, studentsRes] = await Promise.all([
        api.get('/classes'),
        api.get('/grades'),
        api.get('/students'),
      ]);

      const allClasses = classesRes.data.classes || [];
      const allGrades = gradesRes.data.grades || [];
      const allStudents = studentsRes.data.students || [];

      // Enrich classes with grade info and student counts
      const enrichedClasses = allClasses.map((classItem: any) => {
        const grade = allGrades.find(
          (g: any) => g.id === classItem.gradeId || g.id === classItem.grade_id
        );
        
        // Count students in this class
        const classStudents = allStudents.filter(
          (s: any) => (s.classId || s.class_id) === (classItem.id || classItem._id)
        );
        
        // Get teachers (if available in class data)
        const teachers = classItem.teachers || classItem.teacherIds?.map((teacherId: string) => {
          // You might need to fetch staff data separately if teachers aren't in class data
          return { id: teacherId, firstName: '', lastName: '' };
        }) || [];

        return {
          id: classItem.id || classItem._id,
          name: classItem.name,
          gradeId: classItem.gradeId || classItem.grade_id,
          gradeName: grade?.name || '—',
          roomNumber: classItem.roomNumber || classItem.room_number,
          studentCount: classStudents.length,
          teachers: teachers,
        };
      });

      // Sort by grade level, then by class name
      enrichedClasses.sort((a, b) => {
        const gradeA = allGrades.find((g: any) => g.id === a.gradeId);
        const gradeB = allGrades.find((g: any) => g.id === b.gradeId);
        const levelA = gradeA?.level || 0;
        const levelB = gradeB?.level || 0;
        if (levelA !== levelB) return levelA - levelB;
        return a.name.localeCompare(b.name);
      });

      setClasses(enrichedClasses);
    } catch (err: any) {
      console.error('Error loading classes:', err);
      setError(err?.response?.data?.message || 'Failed to load classes');
    } finally {
      setLoading(false);
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

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={loadData}>Retry</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          All Classes View
        </Typography>
        <Typography variant="body2" color="text.secondary">
          School-wide class overview with detailed metrics ({classes.length} classes)
        </Typography>
      </Box>

      {/* Classes Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Students</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teachers</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No classes found. Create classes to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((classItem) => (
                  <TableRow
                    key={classItem.id}
                    sx={{
                      '&:hover': {
                        bgcolor: '#f5f5f5',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {classItem.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={classItem.gradeName || '—'} size="small" sx={{ bgcolor: '#e3f2fd' }} />
                    </TableCell>
                    <TableCell>
                      {classItem.roomNumber ? (
                        <Chip label={classItem.roomNumber} size="small" variant="outlined" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {classItem.studentCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {classItem.teachers && classItem.teachers.length > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {classItem.teachers.slice(0, 2).map((teacher) => (
                            <Avatar
                              key={teacher.id}
                              sx={{ width: 24, height: 24, bgcolor: '#667eea', fontSize: '0.75rem' }}
                            >
                              {teacher.firstName?.[0] || ''}{teacher.lastName?.[0] || ''}
                            </Avatar>
                          ))}
                          {classItem.teachers.length > 2 && (
                            <Typography variant="caption" color="text.secondary">
                              +{classItem.teachers.length - 2}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No teachers assigned
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/principal/classes/${classItem.id}`)}
                      >
                        <Visibility />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
