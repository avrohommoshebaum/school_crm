import { Paper, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', attendance: 95.2 },
  { day: 'Tue', attendance: 96.8 },
  { day: 'Wed', attendance: 94.5 },
  { day: 'Thu', attendance: 97.1 },
  { day: 'Fri', attendance: 96.5 },
];

export default function AttendanceChartWidget() {
  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Weekly Attendance Trends
      </Typography>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis domain={[90, 100]} />
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend />
          <Line
            type="monotone"
            dataKey="attendance"
            stroke="#1976d2"
            strokeWidth={2}
            name="Attendance %"
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  );
}
