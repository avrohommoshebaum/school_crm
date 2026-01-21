import { Paper, Typography, Box } from '@mui/material';
import { Class as ClassIcon } from '@mui/icons-material';

export default function MyClassesWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            My Classes
          </Typography>
          <Typography variant="h4">
            5
          </Typography>
          <Typography variant="caption" color="text.secondary">
            127 total students
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClassIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}
