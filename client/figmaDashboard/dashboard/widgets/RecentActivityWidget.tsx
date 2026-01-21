import { Paper, Typography, List, ListItem, ListItemText, ListItemIcon, Box, Chip } from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Message as MessageIcon,
} from '@mui/icons-material';

const activities = [
  {
    id: 1,
    type: 'application',
    message: 'New application submitted',
    detail: 'Sarah Goldstein - 3rd Grade',
    time: '10 minutes ago',
    icon: AssignmentIcon,
    color: 'primary',
  },
  {
    id: 2,
    type: 'attendance',
    message: 'Attendance completed',
    detail: 'Mrs. Cohen - 4th Grade',
    time: '25 minutes ago',
    icon: CheckCircleIcon,
    color: 'success',
  },
  {
    id: 3,
    type: 'message',
    message: 'New parent message',
    detail: 'Mrs. Schwartz regarding Leah',
    time: '1 hour ago',
    icon: MessageIcon,
    color: 'info',
  },
  {
    id: 4,
    type: 'enrollment',
    message: 'Student enrolled',
    detail: 'Rivka Klein - 2nd Grade',
    time: '2 hours ago',
    icon: PersonAddIcon,
    color: 'success',
  },
];

export default function RecentActivityWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <ListItem key={activity.id} sx={{ px: 0, py: 1.5 }}>
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    bgcolor: `${activity.color}.main`,
                    color: 'white',
                    p: 0.75,
                    borderRadius: 1,
                    display: 'flex',
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={activity.message}
                secondary={
                  <>
                    <Typography variant="caption" display="block" color="text.secondary">
                      {activity.detail}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {activity.time}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}