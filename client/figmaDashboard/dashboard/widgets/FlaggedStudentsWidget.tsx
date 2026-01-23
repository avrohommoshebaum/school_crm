import { Paper, Typography, Box } from '@mui/material';
import { Flag as FlagIcon } from '@mui/icons-material';

export default function FlaggedStudentsWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Flagged Students
          </Typography>
          <Typography variant="h4">
            7
          </Typography>
          <Typography variant="caption" color="error.main">
            Needs attention
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: 'error.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FlagIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}

