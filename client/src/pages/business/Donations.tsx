import { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Chip,
  Alert,
  Divider,
  Stack,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";

import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import SamplePageOverlay from "../../components/samplePageOverlay";

type DonationMethod = "Credit Card" | "Wire Transfer" | "Donors Fund";

interface Donation {
  id: number;
  donor: string;
  amount: number;
  date: string;
  purpose: string;
  method: DonationMethod;
  receiptSent: boolean;
}

export default function Donations() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);

  const donations: Donation[] = [
    {
      id: 1,
      donor: "Anonymous",
      amount: 5000,
      date: "2024-11-24",
      purpose: "General Fund",
      method: "Wire Transfer",
      receiptSent: true,
    },
    {
      id: 2,
      donor: "Moshe & Rivka Cohen",
      amount: 1800,
      date: "2024-11-20",
      purpose: "Scholarship Fund",
      method: "Credit Card",
      receiptSent: true,
    },
    {
      id: 3,
      donor: "Goldstein Family",
      amount: 500,
      date: "2024-11-15",
      purpose: "Building Fund",
      method: "Donors Fund",
      receiptSent: false,
    },
    {
      id: 4,
      donor: "Klein Family Foundation",
      amount: 10000,
      date: "2024-11-10",
      purpose: "Scholarship Fund",
      method: "Donors Fund",
      receiptSent: true,
    },
  ];

  const filtered = useMemo(
    () =>
      donations.filter(
        (d) =>
          d.donor.toLowerCase().includes(search.toLowerCase()) ||
          d.purpose.toLowerCase().includes(search.toLowerCase())
      ),
    [search, donations]
  );

  const total = donations.reduce((sum, d) => sum + d.amount, 0);

  const copyWireInfo = async () => {
    await navigator.clipboard.writeText(
      `Bank Name: Chase Bank
Account Name: Nachlas Bais Yaakov
Account Number: 1234567890
Routing Number: 021000021
Swift Code: CHASUS33`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SamplePageOverlay /> 
      {/* Header */}
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography variant="h5">Donations</Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage charitable donations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
        >
          New Donation
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <StatCard
          label="Total (YTD)"
          value={`$${total.toLocaleString()}`}
          icon={<FavoriteIcon color="secondary" />}
        />
        <StatCard
          label="This Month"
          value="4 donations"
          icon={<TrendingUpIcon color="success" />}
        />
        <StatCard
          label="Credit Card"
          value="$1,800"
          icon={<CreditCardIcon color="primary" />}
        />
        <StatCard
          label="Donors Fund"
          value="$10,500"
          icon={<AccountBalanceWalletIcon color="info" />}
        />
      </Stack>

      {/* Search */}
      <Card>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search donations by donor or purpose"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
          />
        </CardContent>
      </Card>

      {/* List */}
      <Stack spacing={2}>
        {filtered.map((d) => (
          <Card key={d.id}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between">
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FavoriteIcon color="secondary" />
                    <Typography fontWeight={600}>{d.donor}</Typography>
                    <Chip label={d.method} size="small" />
                    <Chip
                      size="small"
                      color={d.receiptSent ? "success" : "warning"}
                      label={d.receiptSent ? "Receipt Sent" : "Pending"}
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={4}
                    mt={2}
                  >
                    <Info label="Amount" value={`$${d.amount.toLocaleString()}`} />
                    <Info label="Purpose" value={d.purpose} />
                    <Info label="Date" value={d.date} />
                  </Stack>
                </Box>

                <Stack spacing={1}>
                  <Button size="small" variant="outlined">
                    View
                  </Button>
                  {!d.receiptSent && (
                    <Button size="small" variant="outlined">
                      Send Receipt
                    </Button>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Process Donation</DialogTitle>
        <DialogContent dividers>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab label="Credit Card" />
            <Tab label="Wire Transfer" />
            <Tab label="Donors Fund" />
          </Tabs>

          <Box mt={3}>
            {tab === 0 && (
              <Alert severity="info">
                Credit card processing via payment gateway
              </Alert>
            )}

            {tab === 1 && (
              <>
                <Alert severity="success">
                  Provide bank details and log donation when received
                </Alert>

                <Card sx={{ mt: 2 }}>
                  <CardContent>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight={600}>
                        Wire Transfer Info
                      </Typography>
                      <Button
                        size="small"
                        startIcon={
                          copied ? <CheckCircleIcon /> : <ContentCopyIcon />
                        }
                        onClick={copyWireInfo}
                      >
                        {copied ? "Copied" : "Copy"}
                      </Button>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="body2">
                      Chase Bank · Account #1234567890 · Routing 021000021
                    </Typography>
                  </CardContent>
                </Card>
              </>
            )}

            {tab === 2 && (
              <Alert severity="info">
                Donor-advised funds via{" "}
                <Button
                  size="small"
                  endIcon={<OpenInNewIcon />}
                  href="https://thedonorsfund.org"
                  target="_blank"
                >
                  The Donors Fund
                </Button>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
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
  value: string;
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

