import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Assessment, People, TrendingDown, TrendingUp, Visibility, Warning } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import api from '../../utils/api';

interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
  studentCount?: number;
  classCount?: number;
  avgPerformance?: number;
  avgBehavior?: number;
  attendanceRate?: number;
  flaggedStudents?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export default function AllGradesView() {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch grades, classes, and students
      const [gradesRes, classesRes, studentsRes] = await Promise.all([
        api.get('/grades'),
        api.get('/classes'),
        api.get('/students'),
      ]);

      const allGrades = gradesRes.data.grades || [];
      const allClasses = classesRes.data.classes || [];
      const allStudents = studentsRes.data.students || [];

      // Try to fetch flagged students (endpoint might not exist)
      let flaggedStudents: any[] = [];
      try {
        const flaggedRes = await api.get('/principal/flagged-students');
        flaggedStudents = flaggedRes.data.students || [];
      } catch (err: any) {
        // Endpoint might not exist, continue without flagged students
        console.log('Flagged students endpoint not available');
      }

      // Calculate stats for each grade
      const gradesWithStats = await Promise.all(
        allGrades.map(async (grade: Grade) => {
          const gradeClasses = allClasses.filter(
            (cls: any) => (cls.gradeId === grade.id || cls.grade_id === grade.id) && 
            (cls.status === 'active' || !cls.status)
          );
          
          // Get students in this grade (active students only)
          const gradeStudents = allStudents.filter((student: any) => {
            const isInGradeClass = gradeClasses.some(
              (cls: any) => cls.id === student.classId || cls.id === student.class_id
            );
            const isActive = student.enrollmentStatus === 'active' || 
                           student.enrollment_status === 'active' ||
                           !student.enrollmentStatus;
            return isInGradeClass && isActive;
          });

          // Count flagged students in this grade
          const gradeFlaggedStudents = flaggedStudents.filter((flagged: any) => {
            // Match by student ID or class
            return gradeStudents.some((s: any) => 
              s.id === flagged.studentId || 
              s.id === flagged.student_id ||
              s._id === flagged.studentId ||
              s._id === flagged.student_id
            );
          });

          const studentCount = gradeStudents.length;
          const classCount = gradeClasses.length;
          const flaggedCount = gradeFlaggedStudents.length;

          // Calculate trend based on student count (simple heuristic - can be enhanced with historical data)
          let trend: 'up' | 'down' | 'neutral' = 'neutral';
          if (studentCount > 0 && classCount > 0) {
            const avgStudentsPerClass = studentCount / classCount;
            // If average is high, might indicate growth (up), if low might indicate decline (down)
            // For now, keep neutral unless we have historical data
          }

          return {
            ...grade,
            studentCount,
            classCount,
            flaggedStudents: flaggedCount,
            trend,
            // Performance, behavior, and attendance would need specific endpoints
            // For now, only show if we have the data
            avgPerformance: undefined, // Would need report cards API
            avgBehavior: undefined, // Would need behavior tracking API
            attendanceRate: undefined, // Would need attendance API
          };
        })
      );

      // Sort by level
      gradesWithStats.sort((a: Grade, b: Grade) => (a.level || 0) - (b.level || 0));

      setGrades(gradesWithStats);
    } catch (err: any) {
      console.error('Error loading grades:', err);
      setError(err?.response?.data?.message || 'Failed to load grades');
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
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          All Grades View
        </Typography>
        <Typography variant="body2" color="text.secondary">
          School-wide grade overview with detailed metrics
        </Typography>
      </Box>

      {/* Grades Grid */}
      <Grid container spacing={3}>
        {grades.length === 0 ? (
          <Grid item xs={12}>
            <Alert severity="info">
              No grades found. Create grades in Grade Management to get started.
            </Alert>
          </Grid>
        ) : (
          grades.map((grade) => (
          <Grid item xs={12} md={6} lg={4} key={grade.id}>
            <Card
              sx={{
                height: '100%',
                transition: 'all 0.3s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {grade.name}
                  </Typography>
                  {grade.trend === 'up' && <TrendingUp sx={{ color: '#43e97b' }} />}
                  {grade.trend === 'down' && <TrendingDown sx={{ color: '#fa709a' }} />}
                </Box>

                {/* Student & Class Count */}
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    icon={<People sx={{ fontSize: 16 }} />}
                    label={`${grade.studentCount || 0} Students`}
                    size="small"
                    sx={{ bgcolor: '#f0f0f0' }}
                  />
                  <Chip
                    label={`${grade.classCount || 0} Classes`}
                    size="small"
                    sx={{ bgcolor: '#f0f0f0' }}
                  />
                </Box>

                {/* Metrics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Performance
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 600 }}>
                      {grade.avgPerformance || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Behavior
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#f093fb', fontWeight: 600 }}>
                      {grade.avgBehavior || '—'}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="caption" color="text.secondary">
                      Attendance
                    </Typography>
                    <Typography variant="h5" sx={{ color: '#43e97b', fontWeight: 600 }}>
                      {grade.attendanceRate ? `${grade.attendanceRate}%` : '—'}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Flagged Students */}
                {grade.flaggedStudents && grade.flaggedStudents > 0 && (
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Warning sx={{ color: '#fa709a', fontSize: 18 }} />
                    <Typography variant="body2" color="error">
                      {grade.flaggedStudents} flagged student{grade.flaggedStudents > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                )}

                {/* View Details Button */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Visibility />}
                  onClick={() => navigate(`/principal/head-principal/grade/${grade.id}`)}
                >
                  View Grade Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))
        )}
      </Grid>
    </Box>
  );
}
