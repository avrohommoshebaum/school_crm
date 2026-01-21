import { Paper, Typography, Box } from '@mui/material';
import { Assignment as AssignmentIcon } from '@mui/icons-material';

export default function PendingApplicationsWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Pending Applications
          </Typography>
          <Typography variant="h4">
            18
          </Typography>
          <Typography variant="caption" color="warning.main">
            Needs review
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: 'warning.main',
            color: 'white',
            p: 1.5,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AssignmentIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}
