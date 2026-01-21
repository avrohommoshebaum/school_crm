import { Paper, Typography, Grid, Button } from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Flag as FlagIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function QuickActionsPrincipalWidget() {
  const actions = [
    {
      label: 'Review Applications',
      icon: AssignmentIcon,
      color: 'primary' as const,
      path: '/applications',
    },
    {
      label: 'Add Student',
      icon: PersonAddIcon,
      color: 'success' as const,
      path: '/students',
    },
    {
      label: 'Flagged Students',
      icon: FlagIcon,
      color: 'error' as const,
      path: '/principal-center/flagged-students',
    },
    {
      label: 'Send Communication',
      icon: EmailIcon,
      color: 'info' as const,
      path: '/communication',
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