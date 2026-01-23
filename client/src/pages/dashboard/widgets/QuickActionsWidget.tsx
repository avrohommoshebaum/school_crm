import { Paper, Typography, Grid, Button } from '@mui/material';
import {
  // Admin actions
  People as PeopleIcon,
  School as SchoolIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  // Teacher actions
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Class as ClassIcon,
  Email as EmailIcon,
  // Principal actions
  PersonAdd as PersonAddIcon,
  Flag as FlagIcon,
  // Business actions
  AttachMoney as AttachMoneyIcon,
  CardGiftcard as CardGiftcardIcon,
  Assessment as AssessmentIcon,
  DirectionsBus as DirectionsBusIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  path: string;
}

// All available quick actions
export const ALL_QUICK_ACTIONS: QuickAction[] = [
  // Admin actions
  {
    id: 'manage-users',
    label: 'Manage Users',
    icon: PeopleIcon,
    color: 'primary',
    path: '/admin/users',
  },
  {
    id: 'school-settings',
    label: 'School Settings',
    icon: SchoolIcon,
    color: 'success',
    path: '/admin/school-settings',
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    icon: SecurityIcon,
    color: 'warning',
    path: '/admin/system-settings',
  },
  {
    id: 'staff-management',
    label: 'Staff Management',
    icon: SettingsIcon,
    color: 'info',
    path: '/admin/staff',
  },
  // Teacher actions
  {
    id: 'take-attendance',
    label: 'Take Attendance',
    icon: CheckCircleIcon,
    color: 'primary',
    path: '/teacher-center/attendance',
  },
  {
    id: 'enter-grades',
    label: 'Enter Grades',
    icon: AssignmentIcon,
    color: 'success',
    path: '/teacher-center/report-cards',
  },
  {
    id: 'view-classes',
    label: 'View Classes',
    icon: ClassIcon,
    color: 'info',
    path: '/teacher-center/my-classes',
  },
  {
    id: 'message-parents',
    label: 'Message Parents',
    icon: EmailIcon,
    color: 'warning',
    path: '/communication',
  },
  // Principal actions
  {
    id: 'review-applications',
    label: 'Review Applications',
    icon: AssignmentIcon,
    color: 'primary',
    path: '/applications',
  },
  {
    id: 'add-student',
    label: 'Add Student',
    icon: PersonAddIcon,
    color: 'success',
    path: '/students',
  },
  {
    id: 'flagged-students',
    label: 'Flagged Students',
    icon: FlagIcon,
    color: 'error',
    path: '/principal-center/flagged-students',
  },
  {
    id: 'send-communication',
    label: 'Send Communication',
    icon: EmailIcon,
    color: 'info',
    path: '/communication',
  },
  // Business actions
  {
    id: 'tuition-management',
    label: 'Tuition Management',
    icon: AttachMoneyIcon,
    color: 'primary',
    path: '/business-office/tuition',
  },
  {
    id: 'donations',
    label: 'Donations',
    icon: CardGiftcardIcon,
    color: 'success',
    path: '/business-office/donations',
  },
  {
    id: 'financial-reports',
    label: 'Financial Reports',
    icon: AssessmentIcon,
    color: 'info',
    path: '/business-office/reports',
  },
  {
    id: 'transportation',
    label: 'Transportation',
    icon: DirectionsBusIcon,
    color: 'warning',
    path: '/business-office/transportation',
  },
];

interface QuickActionsWidgetProps {
  selectedActions?: string[]; // Array of action IDs
}

export default function QuickActionsWidget({ selectedActions }: QuickActionsWidgetProps) {
  // If no selectedActions provided, show all actions (backward compatibility)
  const actionsToShow = selectedActions && selectedActions.length > 0
    ? ALL_QUICK_ACTIONS.filter(action => selectedActions.includes(action.id))
    : ALL_QUICK_ACTIONS;

  if (actionsToShow.length === 0) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No actions selected. Configure this widget to add actions.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={1.5}>
        {actionsToShow.map((action) => {
          const Icon = action.icon;
          return (
            <Grid xs={6} key={action.id}>
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

