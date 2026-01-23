import { Paper, Typography, Box } from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export default function TodaysAttendanceWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Today's Attendance
          </Typography>
          <Typography variant="h4">
            96.5%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            330 of 342 present
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: 'success.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}

