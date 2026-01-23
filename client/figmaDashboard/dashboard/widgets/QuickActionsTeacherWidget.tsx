import { Paper, Typography, Grid, Button } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Class as ClassIcon,
  Email as EmailIcon,
} from '@mui/icons-material';

export default function QuickActionsTeacherWidget() {
  const actions = [
    {
      label: 'Take Attendance',
      icon: CheckCircleIcon,
      color: 'primary' as const,
      path: '#/teacher-center/attendance',
    },
    {
      label: 'Enter Grades',
      icon: AssignmentIcon,
      color: 'success' as const,
      path: '#/teacher-center/report-cards',
    },
    {
      label: 'View Classes',
      icon: ClassIcon,
      color: 'info' as const,
      path: '#/teacher-center/my-classes',
    },
    {
      label: 'Message Parents',
      icon: EmailIcon,
      color: 'warning' as const,
      path: '#/communication',
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
            <Grid xs={6} key={action.label}>
              <Button
                fullWidth
                variant="outlined"
                href={action.path}
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

