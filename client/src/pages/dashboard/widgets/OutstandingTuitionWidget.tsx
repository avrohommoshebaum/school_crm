import { useEffect, useState } from 'react';
import { Paper, Typography, Box, CircularProgress } from '@mui/material';
import { AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import api from '../../../utils/api';

export default function OutstandingTuitionWidget() {
  const [outstanding, setOutstanding] = useState<{ amount: number; families: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOutstanding = async () => {
      try {
        setLoading(true);
        // Note: This endpoint may need to be implemented
        // For now, using a placeholder
        try {
          const response = await api.get('/business-office/tuition/outstanding');
          setOutstanding({
            amount: response.data.total || 0,
            families: response.data.families || 0,
          });
        } catch (err: any) {
          // If endpoint doesn't exist, default to 0
          if (err.response?.status === 404) {
            setOutstanding({ amount: 0, families: 0 });
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching outstanding tuition:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchOutstanding();
  }, []);

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Outstanding Tuition
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Typography variant="h6" color="error">
              {error}
            </Typography>
          ) : outstanding ? (
            <>
              <Typography variant="h4">
                ${typeof outstanding.amount === 'number' 
                  ? outstanding.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                  : outstanding.amount}
              </Typography>
              <Typography variant="caption" color="error.main">
                {outstanding.families} families
              </Typography>
            </>
          ) : (
            <Typography variant="h6">$0</Typography>
          )}
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