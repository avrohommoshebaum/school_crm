import { Paper, Typography, Grid, Button } from '@mui/material';
import {
  People as PeopleIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function QuickActionsAdminWidget() {
  const actions = [
    {
      label: 'Manage Users',
      icon: PeopleIcon,
      color: 'primary' as const,
      path: '/admin/users',
    },
    {
      label: 'School Settings',
      icon: SchoolIcon,
      color: 'success' as const,
      path: '/admin/school-settings',
    },
    {
      label: 'System Settings',
      icon: SecurityIcon,
      color: 'warning' as const,
      path: '/admin/system-settings',
    },
    {
      label: 'Staff Management',
      icon: SettingsIcon,
      color: 'info' as const,
      path: '/admin/staff',
    },
  ];

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={1.5}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid item xs={6} key={action.label}>
              <Button
                fullWidth
                variant="outlined"
                component={Link}
                to={action.path}
                sx={{
                  py: 2,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: `${action.color}.main`,
                  color: `${action.color}.main`,
                  textDecoration: 'none',
                  '&:hover': {
                    borderColor: `${action.color}.dark`,
                    bgcolor: `${action.color}.50`,
                    textDecoration: 'none',
                  },
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
                <Typography variant="caption">{action.label}</Typography>
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}