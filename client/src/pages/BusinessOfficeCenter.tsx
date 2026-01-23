import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  Box,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DescriptionIcon from '@mui/icons-material/Description';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import type { JSX } from 'react';

import SamplePageOverlay from '../components/samplePageOverlay';

export default function BusinessOfficeCenter(): JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const isMainPage = location.pathname === '/business-office';

  const stats = [
    {
      name: 'Monthly Tuition',
      value: '$245,680',
      change: '+5% from last month',
      icon: <AttachMoneyIcon />,
      color: 'success',
    },
    {
      name: 'Outstanding Balance',
      value: '$32,450',
      change: '15 families',
      icon: <TrendingUpIcon />,
      color: 'warning',
    },
    {
      name: 'Donations (YTD)',
      value: '$89,500',
      change: '45 donors',
      icon: <FavoriteIcon />,
      color: 'secondary',
    },
    {
      name: 'Transportation Fees',
      value: '$18,200',
      change: '87 students on buses',
      icon: <DirectionsBusIcon />,
      color: 'info',
    },
  ];

  const recentTransactions = [
    { id: 1, type: 'tuition', label: 'Cohen Family', amount: '$1,200', date: '2024-11-25', method: 'Credit Card' },
    { id: 2, type: 'donation', label: 'Anonymous Donor', amount: '$5,000', date: '2024-11-24', method: 'Check' },
    { id: 3, type: 'tuition', label: 'Goldstein Family', amount: '$1,350', date: '2024-11-23', method: 'Bank Transfer' },
    { id: 4, type: 'transportation', label: 'Schwartz Family', amount: '$210', date: '2024-11-22', method: 'Cash' },
  ];

  const upcomingPayments = [
    { family: 'Levy Family', amount: '$1,200', due: '2024-12-01', type: 'Monthly Tuition' },
    { family: 'Friedman Family', amount: '$1,350', due: '2024-12-01', type: 'Monthly Tuition' },
    { family: 'Klein Family', amount: '$180', due: '2024-12-05', type: 'Transportation' },
  ];

  const overdueBalances = [
    { family: 'Berkowitz Family', amount: '$2,400', days: 15, type: 'Tuition' },
    { family: 'Rosenberg Family', amount: '$1,800', days: 8, type: 'Tuition' },
  ];

  const transactionIcon = (type: string) => {
    switch (type) {
      case 'donation':
        return <FavoriteIcon color="secondary" />;
      case 'transportation':
        return <DirectionsBusIcon color="info" />;
      default:
        return <CreditCardIcon color="success" />;
    }
  };

  if (!isMainPage) return <Outlet />;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h5">Business Office</Typography>
          <Typography variant="body2" color="text.secondary">
            Financial management, tuition, donations, and transportation
          </Typography>
        </Box>
        <Chip label="Business Office Access" color="success" />
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        {stats.map(stat => (
          <Card key={stat.name} sx={{ flex: 1 }}>
            <CardContent>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Chip
                    icon={stat.icon}
                    label={stat.name}
                    color={stat.color as any}
                    variant="outlined"
                  />
                </Stack>
                <Typography variant="h6">{stat.value}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.change}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Transactions + Overdue */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        {/* Recent Transactions */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Recent Transactions</Typography>
                <Typography
                  variant="body2"
                  color="success.main"
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate('/business-office/tuition')}
                >
                  View All
                </Typography>
              </Stack>

              {recentTransactions.map(tx => (
                <Stack
                  key={tx.id}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    {transactionIcon(tx.type)}
                    <Box>
                      <Typography variant="body2">{tx.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {tx.date} • {tx.method}
                      </Typography>
                    </Box>
                  </Stack>
                  <Typography fontWeight={500}>{tx.amount}</Typography>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Overdue */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={600}>Overdue Balances</Typography>
                <Chip label={overdueBalances.length} color="error" size="small" />
              </Stack>

              {overdueBalances.map((bal, i) => (
                <Box
                  key={i}
                  sx={{
                    p: 2,
                    bgcolor: 'error.lighter',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/business-office/tuition')}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="body2">{bal.family}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {bal.type}
                    </Typography>
                    <Typography variant="body2" color="error.main">
                      {bal.amount} • {bal.days} days past due
                    </Typography>
                  </Stack>
                </Box>
              ))}

              {overdueBalances.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No overdue balances
                </Typography>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Upcoming Payments */}
      <Card>
        <CardContent>
          <Typography fontWeight={600} mb={2}>
            Upcoming Payments
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {upcomingPayments.map((p, i) => (
              <Box
                key={i}
                sx={{
                  flex: 1,
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2">{p.family}</Typography>
                    <CalendarMonthIcon fontSize="small" color="disabled" />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {p.type}
                  </Typography>
                  <Typography variant="body2">
                    {p.amount} • Due {p.due}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography fontWeight={600} mb={2}>
            Quick Actions
          </Typography>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <ActionBox icon={<CreditCardIcon />} label="Record Payment" onClick={() => navigate('/business-office/tuition')} />
            <ActionBox icon={<FavoriteIcon />} label="Log Donation" onClick={() => navigate('/business-office/donations')} />
            <ActionBox icon={<UploadFileIcon />} label="Import Families & Students" onClick={() => navigate('/business-office/import')} />
            <ActionBox icon={<PeopleIcon />} label="Send Reminder" onClick={() => navigate('/business-office/tuition')} />
            <ActionBox icon={<DescriptionIcon />} label="Generate Report" onClick={() => navigate('/business-office/reports')} />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

/* ----------------------- */
/* Quick Action Component */
/* ----------------------- */

function ActionBox({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        flex: 1,
        p: 2,
        border: '2px dashed',
        borderColor: 'divider',
        borderRadius: 1,
        textAlign: 'center',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: 'action.hover',
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{ mb: 1 }}>{icon}</Box>
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

