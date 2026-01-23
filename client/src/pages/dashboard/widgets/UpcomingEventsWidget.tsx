import { Paper, Typography, List, ListItem, ListItemText, Box, Chip } from '@mui/material';

// Note: In production, this should fetch from a calendar/events API
// For now, using placeholder data
const events = [
  { id: 1, title: 'Parent-Teacher Conferences', date: 'Jan 15, 2026', type: 'Meeting' },
  { id: 2, title: 'School Play Rehearsal', date: 'Jan 18, 2026', type: 'Event' },
  { id: 3, title: 'Report Cards Due', date: 'Jan 22, 2026', type: 'Deadline' },
  { id: 4, title: 'School Closed - MLK Day', date: 'Jan 20, 2026', type: 'Holiday' },
];

const typeColors: Record<string, 'primary' | 'success' | 'warning' | 'info'> = {
  Meeting: 'primary',
  Event: 'success',
  Deadline: 'warning',
  Holiday: 'info',
};

export default function UpcomingEventsWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Upcoming Events
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {events.map((event) => (
          <ListItem key={event.id} sx={{ px: 0, py: 1.5 }}>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="body2" component="span">{event.title}</Typography>
                  <Chip
                    label={event.type}
                    size="small"
                    color={typeColors[event.type]}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              }
              secondary={event.date}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
