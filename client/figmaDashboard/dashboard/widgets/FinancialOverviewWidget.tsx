import { Paper, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { month: 'Sep', income: 125000, expenses: 98000 },
  { month: 'Oct', income: 118000, expenses: 95000 },
  { month: 'Nov', income: 132000, expenses: 102000 },
  { month: 'Dec', income: 145000, expenses: 110000 },
  { month: 'Jan', income: 128000, expenses: 99000 },
];

export default function FinancialOverviewWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Financial Overview
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
          <Legend />
          <Bar dataKey="income" fill="#4caf50" name="Income" />
          <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
        </BarChart>
      </ResponsiveContainer>
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Total Income
          </Typography>
          <Typography variant="h6" color="success.main">
            $648,000
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Total Expenses
          </Typography>
          <Typography variant="h6" color="error.main">
            $504,000
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Net Profit
          </Typography>
          <Typography variant="h6" color="primary.main">
            $144,000
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

