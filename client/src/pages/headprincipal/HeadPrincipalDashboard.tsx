import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import {
  Assessment,
  People,
  School,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useNavigate } from 'react-router';

export default function HeadPrincipalDashboard() {
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Total Students', 
      value: '445', 
      icon: School, 
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    { 
      label: 'Total Grades', 
      value: '9', 
      icon: Assessment, 
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    { 
      label: 'Total Classes', 
      value: '27', 
      icon: People, 
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
    { 
      label: 'Active Principals', 
      value: '3', 
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
      title: 'Principal Management',
      description: 'Manage principals and their assignments',
      path: '/principal/head-principal/management',
      color: '#f093fb',
      icon: People,
    },
    {
      title: 'Grade Assignments',
      description: 'Assign principals to grade levels',
      path: '/principal/head-principal/grade-assignments',
      color: '#4facfe',
      icon: School,
    },
    {
      title: 'Progress Tracking',
      description: 'Track division-wide academic progress',
      path: '/principal/head-principal/progress-tracking',
      color: '#43e97b',
      icon: Assessment,
    },
  ];

  const recentAlerts = [
    {
      id: 1,
      severity: 'warning' as const,
      message: '5 grades need principal assignment',
      date: 'Today',
    },
    {
      id: 2,
      severity: 'info' as const,
      message: 'Division attendance rate at 95.2%',
      date: 'Today',
    },
    {
      id: 3,
      severity: 'success' as const,
      message: 'Academic performance up 2.4 points',
      date: 'This week',
    },
  ];

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

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                background: stat.gradient,
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.label}
                    </Typography>
                  </Box>
                  <stat.icon sx={{ fontSize: 48, opacity: 0.3 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {quickActions.map((action, index) => (
          <Grid xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s',
                border: '1px solid #e0e0e0',
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
                  <action.icon sx={{ color: action.color, fontSize: 24 }} />
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
        ))}
      </Grid>

      {/* Recent Alerts */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Recent Alerts
      </Typography>
      <Grid container spacing={2}>
        {recentAlerts.map((alert) => (
          <Grid xs={12} key={alert.id}>
            <Card sx={{ bgcolor: '#f8f9fa' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {alert.severity === 'warning' && <Warning sx={{ color: '#fa709a' }} />}
                    {alert.severity === 'info' && <Assessment sx={{ color: '#4facfe' }} />}
                    {alert.severity === 'success' && <TrendingUp sx={{ color: '#43e97b' }} />}
                    <Typography variant="body1">{alert.message}</Typography>
                  </Box>
                  <Chip label={alert.date} size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

