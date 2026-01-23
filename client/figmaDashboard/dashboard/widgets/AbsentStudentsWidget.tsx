import { Paper, Typography, List, ListItem, ListItemText, Chip, Box } from '@mui/material';

const absentStudents = [
  { id: 1, name: 'Sarah Goldstein', grade: '3rd Grade', reason: 'Sick' },
  { id: 2, name: 'Rivka Cohen', grade: '5th Grade', reason: 'Appointment' },
  { id: 3, name: 'Leah Schwartz', grade: '2nd Grade', reason: 'Family Event' },
  { id: 4, name: 'Chaya Klein', grade: '4th Grade', reason: 'Sick' },
  { id: 5, name: 'Devorah Weiss', grade: '1st Grade', reason: 'Not Specified' },
];

export default function AbsentStudentsWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Absent Students Today
        </Typography>
        <Chip label={absentStudents.length} color="error" size="small" />
      </Box>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {absentStudents.map((student) => (
          <ListItem key={student.id} sx={{ px: 0, py: 1 }}>
            <ListItemText
              primary={student.name}
              secondary={
                <>
                  <Typography variant="caption" color="text.secondary" component="span">
                    {student.grade}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', mx: 0.5 }} component="span">•</Typography>
                  <Typography variant="caption" color="text.secondary" component="span">
                    {student.reason}
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
