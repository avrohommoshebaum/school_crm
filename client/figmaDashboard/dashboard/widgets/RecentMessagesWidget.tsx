import { Paper, Typography, List, ListItem, ListItemText, Avatar, Box } from '@mui/material';

const messages = [
  {
    id: 1,
    from: 'Mrs. Schwartz',
    subject: 'Question about homework',
    preview: 'Could you please clarify the assignment for...',
    time: '15 min ago',
    unread: true,
  },
  {
    id: 2,
    from: 'Mrs. Goldstein',
    subject: 'Permission for field trip',
    preview: 'I would like to give permission for Sarah to attend...',
    time: '1 hour ago',
    unread: true,
  },
  {
    id: 3,
    from: 'Mrs. Cohen',
    subject: 'Thank you',
    preview: 'Thank you so much for your help with...',
    time: '3 hours ago',
    unread: false,
  },
];

export default function RecentMessagesWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Messages
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {messages.map((message) => (
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
              {message.from.charAt(0)}
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
        ))}
      </List>
    </Paper>
  );
}