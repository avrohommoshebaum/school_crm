import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Avatar, Box, CircularProgress } from '@mui/material';
import api from '../../../utils/api';

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

export default function RecentMessagesWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        // Get recent messages from communication history
        try {
          const [smsRes, emailRes] = await Promise.all([
            api.get('/sms/history', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { messages: [] } })),
            api.get('/email/history', { params: { page: 1, limit: 5 } }).catch(() => ({ data: { messages: [] } })),
          ]);

          const smsMessages = smsRes.data.messages || [];
          const emailMessages = emailRes.data.messages || [];

          const combined: Message[] = [
            ...smsMessages.map((msg: any) => ({
              id: `sms-${msg.id}`,
              from: msg.sentByName || msg.sent_by_name || 'System',
              subject: 'SMS Message',
              preview: msg.message?.substring(0, 50) || 'Message sent',
              time: formatTimeAgo(new Date(msg.createdAt || msg.created_at || Date.now())),
              unread: false,
            })),
            ...emailMessages.map((msg: any) => ({
              id: `email-${msg.id}`,
              from: msg.fromName || msg.from_name || 'System',
              subject: msg.subject || 'Email Message',
              preview: msg.body?.substring(0, 50) || 'Email sent',
              time: formatTimeAgo(new Date(msg.createdAt || msg.created_at || Date.now())),
              unread: false,
            })),
          ];

          // Sort by time and limit to 5
          combined.sort((a, b) => {
            const timeA = new Date(a.time).getTime();
            const timeB = new Date(b.time).getTime();
            return timeB - timeA;
          });

          setMessages(combined.slice(0, 5));
        } catch (err: any) {
          if (err.response?.status !== 404) {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching messages:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
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
        Recent Messages
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {messages.length === 0 ? (
          <ListItem>
            <ListItemText primary="No recent messages" />
          </ListItem>
        ) : (
          messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                px: 0,
                py: 1.5,
                bgcolor: message.unread ? 'action.hover' : 'transparent',
                borderRadius: 1,
                mb: 0.5,
              }}
            >
              <Avatar sx={{ mr: 1.5, bgcolor: 'primary.main', width: 36, height: 36 }}>
                {message.from.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={message.unread ? 600 : 400}>
                      {message.from}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {message.time}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block" fontWeight={message.unread ? 600 : 400}>
                      {message.subject}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {message.preview}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
