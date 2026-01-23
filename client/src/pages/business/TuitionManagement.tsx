import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ScheduleIcon from "@mui/icons-material/Schedule";

import SamplePageOverlay from "../../components/samplePageOverlay";

type TuitionStatus = "current" | "past-due" | "payment-plan";

interface Family {
  id: number;
  name: string;
  students: string[];
  monthlyTuition: number;
  balance: number;
  lastPayment: string;
  paymentMethod: string;
  status: TuitionStatus;
  yearlyPaid: number;
  yearlyTotal: number;
}

export default function TuitionManagement() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);

  const families: Family[] = [
    {
      id: 1,
      name: "Cohen Family",
      students: ["Sarah Cohen - 3rd Grade", "Leah Cohen - 1st Grade"],
      monthlyTuition: 1200,
      balance: 0,
      lastPayment: "2024-11-01",
      paymentMethod: "Auto-Pay - Credit Card",
      status: "current",
      yearlyPaid: 13200,
      yearlyTotal: 14400,
    },
    {
      id: 2,
      name: "Goldstein Family",
      students: ["Rivka Goldstein - 3rd Grade"],
      monthlyTuition: 650,
      balance: -1300,
      lastPayment: "2024-10-15",
      paymentMethod: "Manual - Check",
      status: "past-due",
      yearlyPaid: 5200,
      yearlyTotal: 7800,
    },
    {
      id: 3,
      name: "Schwartz Family",
      students: ["Leah Schwartz - 4th Grade", "Yakov Schwartz - Pre-K"],
      monthlyTuition: 1350,
      balance: 0,
      lastPayment: "2024-11-01",
      paymentMethod: "Auto-Pay - Bank Transfer",
      status: "current",
      yearlyPaid: 14850,
      yearlyTotal: 16200,
    },
    {
      id: 4,
      name: "Levy Family",
      students: ["Miriam Levy - 2nd Grade"],
      monthlyTuition: 650,
      balance: -650,
      lastPayment: "2024-09-30",
      paymentMethod: "Manual - Cash",
      status: "past-due",
      yearlyPaid: 5850,
      yearlyTotal: 7800,
    },
  ];

  const filtered = useMemo(
    () =>
      families.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search, families]
  );

  const current = filtered.filter((f) => f.status === "current");
  const pastDue = filtered.filter((f) => f.status === "past-due");

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography variant="h5">Tuition Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Track tuition payments and manage family accounts
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="success"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          Record Payment
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <StatCard
          label="Total Families"
          value={families.length}
          icon={<AttachMoneyIcon color="success" />}
        />
        <StatCard
          label="Current"
          value={current.length}
          icon={<CheckCircleIcon color="success" />}
        />
        <StatCard
          label="Past Due"
          value={pastDue.length}
          icon={<ErrorIcon color="error" />}
        />
        <StatCard
          label="Outstanding"
          value="$32,450"
          icon={<ScheduleIcon color="warning" />}
        />
      </Stack>

      {/* Search */}
      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search families..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={`All Families (${filtered.length})`} />
        <Tab label={`Current (${current.length})`} />
        <Tab label={`Past Due (${pastDue.length})`} />
      </Tabs>

      {/* Families */}
      <Stack spacing={2}>
        {(tab === 0 ? filtered : tab === 1 ? current : pastDue).map(
          (family) => (
            <Card
              key={family.id}
              sx={
                family.status === "past-due"
                  ? { borderLeft: "4px solid", borderColor: "error.main" }
                  : undefined
              }
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" justifyContent="space-between">
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography fontWeight={600}>
                          {family.name}
                        </Typography>
                        <StatusChip status={family.status} />
                      </Stack>

                      <Box mt={1}>
                        {family.students.map((s) => (
                          <Typography
                            key={s}
                            variant="body2"
                            color="text.secondary"
                          >
                            • {s}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    <Box textAlign="right">
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Balance
                      </Typography>
                      <Typography
                        variant="h6"
                        color={
                          family.balance < 0
                            ? "error.main"
                            : "success.main"
                        }
                      >
                        {family.balance < 0
                          ? `-$${Math.abs(family.balance)}`
                          : `$${family.balance}`}
                      </Typography>
                    </Box>
                  </Stack>

                  {/* Details */}
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.100",
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={4}
                    >
                      <Info
                        label="Monthly Tuition"
                        value={`$${family.monthlyTuition}`}
                      />
                      <Info
                        label="Last Payment"
                        value={family.lastPayment}
                      />
                      <Info
                        label="Payment Method"
                        value={family.paymentMethod}
                      />
                      <Info
                        label="Yearly Progress"
                        value={`$${family.yearlyPaid} / $${family.yearlyTotal}`}
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined">
                      View Details
                    </Button>
                    <Button size="small" variant="outlined">
                      Payment History
                    </Button>
                    <Button size="small" variant="outlined">
                      Send Reminder
                    </Button>
                    {family.status === "past-due" && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        sx={{ ml: "auto" }}
                      >
                        Contact Family
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )
        )}
      </Stack>

      {/* Payment Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Record Tuition Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Family</InputLabel>
              <Select label="Family">
                {families.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {f.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                label="Payment Amount"
                type="number"
              />
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select label="Payment Method">
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="credit-card">Credit Card</MenuItem>
                <MenuItem value="bank-transfer">Bank Transfer</MenuItem>
                <MenuItem value="auto-pay">Auto-Pay</MenuItem>
              </Select>
            </FormControl>

            <TextField label="Reference Number" fullWidth />
            <TextField label="Notes" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="success">
            Record Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

/* ---------- Helpers ---------- */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <Card sx={{ flex: 1 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h6">{value}</Typography>
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Box>
  );
}

function StatusChip({ status }: { status: TuitionStatus }) {
  const config: Record<TuitionStatus, { label: string; color: any }> = {
    current: { label: "Current", color: "success" },
    "past-due": { label: "Past Due", color: "error" },
    "payment-plan": { label: "Payment Plan", color: "info" },
  };

  return (
    <Chip
      size="small"
      label={config[status].label}
      color={config[status].color}
      variant="outlined"
    />
  );
}

