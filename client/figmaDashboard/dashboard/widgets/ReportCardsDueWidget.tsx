import { Paper, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

const reportCards = [
  { id: 1, className: '3rd Grade - English', dueDate: 'Jan 22, 2026', status: 'Not Started' },
  { id: 2, className: '4th Grade - Math', dueDate: 'Jan 22, 2026', status: 'In Progress' },
  { id: 3, className: '5th Grade - Science', dueDate: 'Jan 25, 2026', status: 'Not Started' },
];

const statusColors: Record<string, 'error' | 'warning' | 'success'> = {
  'Not Started': 'error',
  'In Progress': 'warning',
  'Completed': 'success',
};

export default function ReportCardsDueWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Report Cards Due
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {reportCards.map((report) => (
          <ListItem key={report.id} sx={{ px: 0, py: 1.5 }}>
            <ListItemText
              primary={report.className}
              secondary={`Due: ${report.dueDate}`}
              secondaryTypographyProps={{
                component: 'div',
              }}
            />
            <Chip
              label={report.status}
              size="small"
              color={statusColors[report.status]}
              sx={{ height: 20, fontSize: '0.65rem' }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}