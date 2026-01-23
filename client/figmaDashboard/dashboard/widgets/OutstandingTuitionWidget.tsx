import { Paper, Typography, Box } from '@mui/material';
import { AttachMoney as AttachMoneyIcon } from '@mui/icons-material';

export default function OutstandingTuitionWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Outstanding Tuition
          </Typography>
          <Typography variant="h4">
            $45,230
          </Typography>
          <Typography variant="caption" color="error.main">
            28 families
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
          <AttachMoneyIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}

