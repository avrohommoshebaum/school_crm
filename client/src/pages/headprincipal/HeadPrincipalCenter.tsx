import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Assessment,
  People,
  School,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import useCurrentUser from '../../hooks/useCurrentUser';

interface DashboardStats {
  totalStudents: number;
  totalGrades: number;
  totalClasses: number;
  activePrincipals: number;
}

interface DashboardAlert {
  id: number;
  severity: 'warning' | 'info' | 'success';
  message: string;
  date: string;
}

export default function HeadPrincipalCenter() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useCurrentUser();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalGrades: 0,
    totalClasses: 0,
    activePrincipals: 0,
  });
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (userLoading || !user) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [studentsRes, gradesRes, classesRes, assignmentsRes] = await Promise.all([
          api.get('/students'),
          api.get('/grades'),
          api.get('/classes'),
          api.get('/principal-assignments'),
        ]);

        const students = studentsRes.data.students || [];
        const grades = gradesRes.data.grades || [];
        const classes = classesRes.data.classes || [];
        const assignments = assignmentsRes.data.assignments || [];

        // Calculate active principals (unique principals with active assignments)
        const activePrincipalIds = new Set(
          assignments
            .filter((a: any) => a.isActive)
            .map((a: any) => a.principalId)
        );

        setStats({
          totalStudents: students.length,
          totalGrades: grades.length,
          totalClasses: classes.length,
          activePrincipals: activePrincipalIds.size,
        });

        // Generate alerts based on real data
        const generatedAlerts: DashboardAlert[] = [];
        let alertId = 1;
        
        // Check for unassigned grades
        const assignedGradeIds = new Set(assignments.filter((a: any) => a.isActive).map((a: any) => a.gradeId));
        const unassignedGrades = grades.filter((g: any) => !assignedGradeIds.has(g.id));
        if (unassignedGrades.length > 0) {
          generatedAlerts.push({
            id: alertId++,
            severity: 'warning',
            message: `${unassignedGrades.length} grade${unassignedGrades.length > 1 ? 's' : ''} need${unassignedGrades.length === 1 ? 's' : ''} principal assignment`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        }

        // Check for grades without classes
        const gradesWithClasses = new Set(classes.map((c: any) => c.gradeId || c.grade_id));
        const gradesWithoutClasses = grades.filter((g: any) => !gradesWithClasses.has(g.id));
        if (gradesWithoutClasses.length > 0) {
          generatedAlerts.push({
            id: alertId++,
            severity: 'warning',
            message: `${gradesWithoutClasses.length} grade${gradesWithoutClasses.length > 1 ? 's' : ''} have no classes assigned`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        }

        // Check for classes without students
        const classesWithStudents = classes.filter((c: any) => {
          const classStudents = students.filter((s: any) => 
            (s.classId === c.id || s.class_id === c.id) && 
            (s.enrollmentStatus === 'active' || s.enrollment_status === 'active')
          );
          return classStudents.length > 0;
        });
        const emptyClasses = classes.length - classesWithStudents.length;
        if (emptyClasses > 0) {
          generatedAlerts.push({
            id: alertId++,
            severity: 'info',
            message: `${emptyClasses} class${emptyClasses > 1 ? 'es' : ''} ${emptyClasses === 1 ? 'has' : 'have'} no enrolled students`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        }

        // Try to fetch flagged students
        try {
          const flaggedRes = await api.get('/principal/flagged-students');
          const flaggedStudents = flaggedRes.data.students || [];
          if (flaggedStudents.length > 0) {
            const urgentCount = flaggedStudents.filter((s: any) => s.priority === 'urgent' || s.priority === 'high').length;
            if (urgentCount > 0) {
              generatedAlerts.push({
                id: alertId++,
                severity: 'warning',
                message: `${urgentCount} student${urgentCount > 1 ? 's' : ''} flagged with urgent or high priority`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              });
            } else {
              generatedAlerts.push({
                id: alertId++,
                severity: 'info',
                message: `${flaggedStudents.length} student${flaggedStudents.length > 1 ? 's' : ''} flagged for attention`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              });
            }
          }
        } catch (err: any) {
          // Endpoint might not exist, skip this alert
          console.log('Flagged students endpoint not available');
        }

        // Check for grades with very few students (potential issue)
        const gradesWithLowEnrollment = grades.filter((g: any) => {
          const gradeClasses = classes.filter((c: any) => c.gradeId === g.id || c.grade_id === g.id);
          const gradeStudents = students.filter((s: any) => 
            gradeClasses.some((c: any) => (s.classId === c.id || s.class_id === c.id)) &&
            (s.enrollmentStatus === 'active' || s.enrollment_status === 'active')
          );
          return gradeStudents.length > 0 && gradeStudents.length < 10; // Less than 10 students
        });
        if (gradesWithLowEnrollment.length > 0) {
          generatedAlerts.push({
            id: alertId++,
            severity: 'info',
            message: `${gradesWithLowEnrollment.length} grade${gradesWithLowEnrollment.length > 1 ? 's' : ''} with low enrollment (< 10 students)`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        }

        // Success alert: All grades have principals assigned
        if (unassignedGrades.length === 0 && grades.length > 0) {
          generatedAlerts.push({
            id: alertId++,
            severity: 'success',
            message: `All ${grades.length} grade${grades.length > 1 ? 's' : ''} have principals assigned`,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          });
        }

        // Sort alerts: warnings first, then info, then success
        generatedAlerts.sort((a, b) => {
          const severityOrder = { warning: 0, info: 1, success: 2 };
          return severityOrder[a.severity] - severityOrder[b.severity];
        });

        setAlerts(generatedAlerts);
      } catch (err: any) {
        console.error('Error loading dashboard data:', err);
        setError(err?.response?.data?.message || 'Failed to load dashboard data');
        setSnackbar({
          open: true,
          message: 'Failed to load dashboard data. Please try again.',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user, userLoading]);

  const statCards = [
    {
      label: 'Total Students',
      value: stats.totalStudents.toString(),
      icon: School,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      label: 'Total Grades',
      value: stats.totalGrades.toString(),
      icon: Assessment,
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      label: 'Total Classes',
      value: stats.totalClasses.toString(),
      icon: People,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    {
      label: 'Active Principals',
      value: stats.activePrincipals.toString(),
      icon: People,
      color: '#43e97b',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  ];

  const quickActions = [
    {
      title: 'Division Overview',
      description: 'View school-wide performance metrics and trends',
      path: '/principal/head-principal/division-overview',
      color: '#667eea',
      icon: TrendingUp,
    },
    {
      title: 'Grade Management',
      description: 'Create and manage grade levels',
      path: '/principal/head-principal/grade-management',
      color: '#f093fb',
      icon: School,
    },
    {
      title: 'Principal Management',
      description: 'Manage principals and their assignments',
      path: '/principal/head-principal/management',
      color: '#f5576c',
      icon: People,
    },
    {
      title: 'Grade Assignments',
      description: 'Assign principals to grade levels',
      path: '/principal/head-principal/grade-assignments',
      color: '#4facfe',
      icon: Assessment,
    },
    {
      title: 'Progress Tracking',
      description: 'Track division-wide academic progress',
      path: '/principal/head-principal/progress-tracking',
      color: '#43e97b',
      icon: Assessment,
    },
  ];

  if (userLoading || loading) {
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

  if (error && !stats.totalStudents && !stats.totalGrades) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body2" color="text.secondary">
          Please check your permissions and try refreshing the page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
          Head Principal Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Division-wide oversight and management
        </Typography>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error} (Some data may be incomplete)
        </Alert>
      )}

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  background: stat.gradient,
                  color: 'white',
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Icon sx={{ fontSize: 48, opacity: 0.3 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  border: '1px solid #e0e0e0',
                  height: '100%',
                  '&:hover': {
                    borderColor: action.color,
                    boxShadow: `0 4px 12px ${action.color}33`,
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      bgcolor: `${action.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    <Icon sx={{ color: action.color, fontSize: 24 }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Recent Alerts */}
      {alerts.length > 0 && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Recent Alerts
          </Typography>
          <Grid container spacing={2}>
            {alerts.map((alert) => (
              <Grid item xs={12} key={alert.id}>
                <Card sx={{ bgcolor: '#f8f9fa' }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {alert.severity === 'warning' && (
                          <Warning sx={{ color: '#fa709a' }} />
                        )}
                        {alert.severity === 'info' && (
                          <Assessment sx={{ color: '#4facfe' }} />
                        )}
                        {alert.severity === 'success' && (
                          <TrendingUp sx={{ color: '#43e97b' }} />
                        )}
                        <Typography variant="body1">{alert.message}</Typography>
                      </Box>
                      <Chip label={alert.date} size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
