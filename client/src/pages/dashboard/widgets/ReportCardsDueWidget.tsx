import { useEffect, useState } from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Chip, CircularProgress } from '@mui/material';
import api from '../../../utils/api';

interface ReportCard {
  id: string;
  className: string;
  dueDate: string;
  status: string;
}

const statusColors: Record<string, 'error' | 'warning' | 'success'> = {
  'Not Started': 'error',
  'In Progress': 'warning',
  'Completed': 'success',
  'pending': 'error',
  'in_progress': 'warning',
  'completed': 'success',
};

export default function ReportCardsDueWidget() {
  const [reportCards, setReportCards] = useState<ReportCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportCards = async () => {
      try {
        setLoading(true);
        // Note: This endpoint may need to be implemented
        // For now, using a placeholder
        try {
          const response = await api.get('/report-cards/due');
          const cards = response.data.reportCards || [];
          setReportCards(cards.slice(0, 5)); // Limit to 5 for widget
        } catch (err: any) {
          if (err.response?.status === 404) {
            setReportCards([]);
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        console.error('Error fetching report cards:', err);
        setError('Failed to load');
      } finally {
        setLoading(false);
      }
    };

    fetchReportCards();
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
        Report Cards Due
      </Typography>
      <List sx={{ flex: 1, overflow: 'auto' }}>
        {reportCards.length === 0 ? (
          <ListItem>
            <ListItemText primary="No report cards due" secondary="All report cards are up to date" />
          </ListItem>
        ) : (
          reportCards.map((report) => (
            <ListItem key={report.id} sx={{ px: 0, py: 1.5 }}>
              <ListItemText
                primary={report.className}
                secondary={`Due: ${new Date(report.dueDate).toLocaleDateString()}`}
                secondaryTypographyProps={{
                  component: 'div',
                }}
              />
              <Chip
                label={report.status}
                size="small"
                color={statusColors[report.status] || 'default'}
                sx={{ height: 20, fontSize: '0.65rem' }}
              />
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}