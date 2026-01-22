import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
} from '@mui/material';
import {
  ArrowBack,
  Class,
  People,
  School,
  Visibility,
} from '@mui/icons-material';
import api from '../../utils/api';

interface Grade {
  id: string;
  name: string;
  level: number;
  description?: string;
}

interface Class {
  id: string;
  name: string;
  roomNumber?: string;
  studentCount: number;
  teachers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  }>;
}

export default function GradeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [grade, setGrade] = useState<Grade | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    avgStudentsPerClass: 0,
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch grade details, classes, and students
      const [gradeRes, classesRes, studentsRes] = await Promise.all([
        api.get(`/grades/${id}`),
        api.get(`/principal/grades/${id}/classes`).catch(() => ({ data: { classes: [] } })),
        api.get('/students'),
      ]);

      const gradeData = gradeRes.data.grade;
      setGrade(gradeData);

      const classesData = classesRes.data.classes || [];
      setClasses(classesData);

      // Calculate total students in this grade
      const allStudents = studentsRes.data.students || [];
      const gradeStudents = allStudents.filter((student: any) => {
        const isInGradeClass = classesData.some(
          (cls: any) => cls.id === student.classId || cls.id === student.class_id
        );
        const isActive = student.enrollmentStatus === 'active' || 
                        student.enrollment_status === 'active' ||
                        !student.enrollmentStatus;
        return isInGradeClass && isActive;
      });

      const totalStudents = gradeStudents.length;
      const totalClasses = classesData.length;
      const avgStudentsPerClass = totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0;

      setStats({
        totalStudents,
        totalClasses,
        avgStudentsPerClass,
      });
    } catch (err: any) {
      console.error('Error loading grade data:', err);
      setError(err?.response?.data?.message || 'Failed to load grade data');
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId: string) => {
    navigate(`/principal/classes/${classId}`);
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

  if (error || !grade) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Grade not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/principal/head-principal/division-overview')}>
          Back to Grades
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/principal/head-principal/division-overview')}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
            {grade.name}
          </Typography>
          {grade.description && (
            <Typography variant="body2" color="text.secondary">
              {grade.description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Grade Overview - Small and Compact */}
      <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
        <CardContent sx={{ py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Total Students
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#667eea' }}>
                  {stats.totalStudents}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Total Classes
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#f093fb' }}>
                  {stats.totalClasses}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Avg per Class
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#4facfe' }}>
                  {stats.avgStudentsPerClass}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Grade Level
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#43e97b' }}>
                  {grade.level}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Classes Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Classes ({classes.length})
        </Typography>
      </Box>

      {classes.length === 0 ? (
        <Alert severity="info">
          No classes found for this grade. Create classes to get started.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Class Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Students</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teachers</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((classItem) => (
                <TableRow
                  key={classItem.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleClassClick(classItem.id)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Class sx={{ color: '#667eea' }} />
                      <Typography sx={{ fontWeight: 500 }}>
                        {classItem.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {classItem.roomNumber ? (
                      <Chip label={classItem.roomNumber} size="small" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <People sx={{ fontSize: 18, color: '#4facfe' }} />
                      <Typography>{classItem.studentCount || 0}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {classItem.teachers && classItem.teachers.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {classItem.teachers.slice(0, 2).map((teacher) => (
                          <Chip
                            key={teacher.id}
                            label={`${teacher.firstName} ${teacher.lastName}`}
                            size="small"
                            avatar={
                              <Avatar sx={{ bgcolor: '#667eea', width: 24, height: 24, fontSize: '0.75rem' }}>
                                {teacher.firstName[0]}{teacher.lastName[0]}
                              </Avatar>
                            }
                          />
                        ))}
                        {classItem.teachers.length > 2 && (
                          <Chip
                            label={`+${classItem.teachers.length - 2}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No teachers assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClassClick(classItem.id);
                      }}
                    >
                      View Students
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
