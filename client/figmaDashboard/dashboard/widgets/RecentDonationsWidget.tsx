import { Paper, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

const donations = [
  { id: 1, donor: 'Anonymous', amount: 5000, date: 'Jan 4, 2026', purpose: 'General Fund' },
  { id: 2, donor: 'Goldstein Family', amount: 1800, date: 'Jan 3, 2026', purpose: 'Scholarship Fund' },
  { id: 3, donor: 'Cohen Foundation', amount: 10000, date: 'Jan 2, 2026', purpose: 'Building Fund' },
  { id: 4, donor: 'Schwartz Family', amount: 2500, date: 'Dec 30, 2025', purpose: 'General Fund' },
];

export default function RecentDonationsWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Recent Donations
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {donations.map((donation) => (
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
                  <Typography variant="caption" color="text.secondary" component="span">
                    {donation.purpose}
                  </Typography>
                  <Typography variant="caption" color="text.disabled" component="span" sx={{ ml: 1 }}>
                    {donation.date}
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
