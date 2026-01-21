import { Paper, Typography, Box } from '@mui/material';
import { School as SchoolIcon } from '@mui/icons-material';

export default function TotalStudentsWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Total Students
          </Typography>
          <Typography variant="h4">
            342
          </Typography>
          <Typography variant="caption" color="success.main">
            +12 this month
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
          <SchoolIcon sx={{ fontSize: 32 }} />
        </Box>
      </Box>
    </Paper>
  );
}
