import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, ListItemIcon, Box, CircularProgress } from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Message as MessageIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import api from '../../../utils/api';

interface Activity {
  id: string;
  type: 'application' | 'attendance' | 'message' | 'enrollment' | 'user' | 'settings';
  message: string;
  detail: string;
  time: string; // Formatted time string or timestamp
  timestamp?: number; // Internal timestamp for sorting
}

export default function RecentActivityWidget() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        
        // Combine activity from multiple sources
        const activityList: Activity[] = [];
        
        // Get recent applications
        try {
          const appsRes = await api.get('/applications', { params: { limit: 5 } });
          const apps = appsRes.data.applications || [];
          apps.forEach((app: any) => {
            const createdAt = app.createdAt || app.created_at || Date.now();
            activityList.push({
              id: `app-${app.id}`,
              type: 'application',
              message: 'New application submitted',
              detail: `${app.firstName || ''} ${app.lastName || ''} - ${app.grade || 'N/A'}`,
              time: createdAt, // Store raw timestamp for sorting
            });
          });
        } catch (err) {
          // Ignore if endpoint doesn't exist
        }

        // Get recent messages (SMS/Email)
        try {
          const [smsRes, emailRes] = await Promise.all([
            api.get('/sms/history', { params: { page: 1, limit: 3 } }).catch(() => ({ data: { messages: [] } })),
            api.get('/email/history', { params: { page: 1, limit: 3 } }).catch(() => ({ data: { messages: [] } })),
          ]);
          
          const smsMessages = smsRes.data.messages || [];
          const emailMessages = emailRes.data.messages || [];
          
          [...smsMessages, ...emailMessages].slice(0, 3).forEach((msg: any) => {
            const createdAt = msg.createdAt || msg.created_at || Date.now();
            activityList.push({
              id: `msg-${msg.id}`,
              type: 'message',
              message: 'Message sent',
              detail: `To ${msg.recipientCount || 0} recipients`,
              time: createdAt, // Store raw timestamp for sorting
            });
          });
        } catch (err) {
          // Ignore if endpoint doesn't exist
        }

        // Sort by timestamp (most recent first) before formatting
        // Convert time strings/timestamps to Date objects for sorting
        const activitiesWithDates = activityList.map(activity => {
          let date: Date;
          if (typeof activity.time === 'string') {
            date = new Date(activity.time);
          } else if (typeof activity.time === 'number') {
            date = new Date(activity.time);
          } else {
            date = new Date();
          }
          
          return {
            ...activity,
            _sortDate: date.getTime(), // Internal property for sorting
            _date: date, // Store Date object for formatting
          };
        });
        
        // Sort by timestamp (most recent first)
        activitiesWithDates.sort((a, b) => b._sortDate - a._sortDate);

        // Format times after sorting and limit to 5
        const sortedActivities = activitiesWithDates.slice(0, 5).map(({ _sortDate, _date, ...activity }) => ({
          ...activity,
          time: formatTimeAgo(_date),
        }));

        setActivities(sortedActivities);
      } catch (err: any) {
        console.error('Error fetching activities:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return AssignmentIcon;
      case 'attendance':
        return CheckCircleIcon;
      case 'message':
        return MessageIcon;
      case 'enrollment':
      case 'user':
        return PersonAddIcon;
      default:
        return SchoolIcon;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'application':
        return 'primary';
      case 'attendance':
        return 'success';
      case 'message':
        return 'info';
      case 'enrollment':
      case 'user':
        return 'success';
      default:
        return 'primary';
    }
  };

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  }

  if (loading) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Activity
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {activities.length === 0 ? (
          <ListItem>
            <ListItemText primary="No recent activity" />
          </ListItem>
        ) : (
          activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.type);
            
            return (
              <ListItem key={activity.id} sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Box
                    sx={{
                      bgcolor: `${color}.main`,
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
          })
        )}
      </List>
    </Paper>
  );
}
