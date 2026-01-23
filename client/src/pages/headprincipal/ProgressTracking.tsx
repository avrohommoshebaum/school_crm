import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Typography,
  Alert,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
}

interface GradeStats {
  id: string;
  name: string;
  level: number;
  studentCount: number;
  classCount: number;
  avgPerformance?: number;
  avgBehavior?: number;
  attendanceRate?: number;
}

export default function ProgressTracking() {
  const navigate = useNavigate();
  const [grades, setGrades] = useState<GradeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch grades, classes, and students
      const [gradesRes, classesRes, studentsRes] = await Promise.all([
        api.get('/grades'),
        api.get('/classes'),
        api.get('/students'),
      ]);

      const allGrades = (gradesRes.data.grades || []).sort((a: Grade, b: Grade) => 
        (a.level || 0) - (b.level || 0)
      );
      const allClasses = classesRes.data.classes || [];
      const allStudents = studentsRes.data.students || [];

      // Calculate stats for each grade
      const gradeStats: GradeStats[] = allGrades.map((grade: Grade) => {
        // Get classes for this grade
        const gradeClasses = allClasses.filter(
          (cls: any) => cls.gradeId === grade.id || cls.grade_id === grade.id
        );

        // Get students in this grade (via classes)
        const gradeStudents = allStudents.filter((student: any) => {
          const isInGradeClass = gradeClasses.some(
            (cls: any) => cls.id === student.classId || cls.id === student.class_id
          );
          const isActive = student.enrollmentStatus === 'active' || 
                          student.enrollment_status === 'active' ||
                          !student.enrollmentStatus;
          return isInGradeClass && isActive;
        });

        return {
          id: grade.id,
          name: grade.name,
          level: grade.level || 0,
          studentCount: gradeStudents.length,
          classCount: gradeClasses.length,
          // Performance, behavior, and attendance metrics would come from report cards or assessments
          // For now, these are undefined until those APIs are available
          avgPerformance: undefined,
          avgBehavior: undefined,
          attendanceRate: undefined,
        };
      });

      setGrades(gradeStats);
    } catch (err: any) {
      console.error('Error loading progress data:', err);
      setError(err?.response?.data?.message || 'Failed to load progress data');
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
          Division-Wide Progress Tracking
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Monitor academic progress across all grade levels ({grades.length} grades)
        </Typography>
      </Box>

      {/* Grade Cards */}
      {grades.length === 0 ? (
        <Alert severity="info">
          No grades found. Create grades in Grade Management to get started.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {grades.map((grade) => (
            <Grid xs={12} md={6} key={grade.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {grade.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Performance
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: grade.avgPerformance !== undefined 
                            ? (grade.avgPerformance >= 85 ? '#43e97b' : grade.avgPerformance >= 75 ? '#667eea' : '#fa709a')
                            : '#667eea',
                          fontWeight: 600 
                        }}
                      >
                        {grade.avgPerformance !== undefined ? grade.avgPerformance : '—'}
                      </Typography>
                    </Grid>
                    <Grid xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Behavior
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: grade.avgBehavior !== undefined 
                            ? (grade.avgBehavior >= 85 ? '#43e97b' : grade.avgBehavior >= 75 ? '#667eea' : '#fa709a')
                            : '#f093fb',
                          fontWeight: 600 
                        }}
                      >
                        {grade.avgBehavior !== undefined ? grade.avgBehavior : '—'}
                      </Typography>
                    </Grid>
                    <Grid xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Attendance
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: grade.attendanceRate !== undefined 
                            ? (grade.attendanceRate >= 95 ? '#43e97b' : grade.attendanceRate >= 90 ? '#667eea' : '#fa709a')
                            : '#43e97b',
                          fontWeight: 600 
                        }}
                      >
                        {grade.attendanceRate !== undefined ? `${grade.attendanceRate}%` : '—'}
                      </Typography>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {grade.studentCount} students · {grade.classCount} classes
                    </Typography>
                    <Button 
                      size="small" 
                      endIcon={<Visibility />}
                      onClick={() => navigate(`/principal/head-principal/grade/${grade.id}`)}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

