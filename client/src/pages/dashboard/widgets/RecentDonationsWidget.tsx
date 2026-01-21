import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Box, CircularProgress } from '@mui/material';
import api from '../../../utils/api';

interface Donation {
  id: string;
  donor: string;
  amount: number;
  date: string;
  purpose?: string;
}

export default function RecentDonationsWidget() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        // Note: This endpoint may need to be implemented
        // For now, using a placeholder
        try {
          const response = await api.get('/business-office/donations/recent');
          const donationsList = response.data.donations || [];
          setDonations(donationsList.slice(0, 5)); // Limit to 5 for widget
        } catch (err: any) {
          if (err.response?.status === 404) {
            setDonations([]);
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching donations:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  if (loading) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2.5, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Donations
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {donations.length === 0 ? (
          <ListItem>
            <ListItemText primary="No recent donations" />
          </ListItem>
        ) : (
          donations.map((donation) => (
            <ListItem key={donation.id} sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" component="span">{donation.donor}</Typography>
                    <Typography variant="body2" color="success.main" fontWeight={600} component="span">
                      ${donation.amount.toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    {donation.purpose && (
                      <Typography variant="caption" color="text.secondary" component="span">
                        {donation.purpose}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.disabled" component="span" sx={{ ml: 1 }}>
                      {new Date(donation.date).toLocaleDateString()}
                    </Typography>
                  </>
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}