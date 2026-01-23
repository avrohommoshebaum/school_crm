import { Paper, Typography, Grid, Button } from '@mui/material';
import {
  AttachMoney as AttachMoneyIcon,
  CardGiftcard as CardGiftcardIcon,
  Assessment as AssessmentIcon,
  DirectionsBus as DirectionsBusIcon,
} from '@mui/icons-material';

export default function QuickActionsBusinessWidget() {
  const actions = [
    {
      label: 'Tuition Management',
      icon: AttachMoneyIcon,
      color: 'primary' as const,
      path: '#/business-office/tuition',
    },
    {
      label: 'Donations',
      icon: CardGiftcardIcon,
      color: 'success' as const,
      path: '#/business-office/donations',
    },
    {
      label: 'Financial Reports',
      icon: AssessmentIcon,
      color: 'info' as const,
      path: '#/business-office/reports',
    },
    {
      label: 'Transportation',
      icon: DirectionsBusIcon,
      color: 'warning' as const,
      path: '#/business-office/transportation',
    },
  ];

  return (
    <Paper sx={{ p: 2.5, height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      <Grid container spacing={1.5}>
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Grid xs={6} key={action.label}>
              <Button
                fullWidth
                variant="outlined"
                href={action.path}
                sx={{
                  py: 2,
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: `${action.color}.main`,
                  color: `${action.color}.main`,
                  textDecoration: 'none',
                  '&:hover': {
                    borderColor: `${action.color}.dark`,
                    bgcolor: `${action.color}.50`,
                    textDecoration: 'none',
                  },
                }}
              >
                <Icon sx={{ fontSize: 28 }} />
                <Typography variant="caption">{action.label}</Typography>
              </Button>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
}

