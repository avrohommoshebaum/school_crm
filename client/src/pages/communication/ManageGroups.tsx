import { useMemo, useState } from "react";
import {
  Users,
  Plus,
  Hash,
  Copy,
  Check,
  Smartphone,
  Phone,
  MessageSquare,
  Edit2,
  Eye,
  UserPlus,
  Upload,
  X,
  Search,
} from "lucide-react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import SamplePageOverlay from "../../components/samplePageOverlay";

type Group = {
  id: string;
  name: string;
  count: number;
  description: string;
  pin: string;
};

export default function ManageGroups() {
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const groups: Group[] = [
    { id: "1", name: "All Parents", count: 487, description: "All parents", pin: "1001" },
    { id: "2", name: "1st Grade Parents", count: 65, description: "Grade 1", pin: "1234" },
    { id: "3", name: "2nd Grade Parents", count: 72, description: "Grade 2", pin: "1235" },
    { id: "4", name: "Staff Members", count: 45, description: "All staff", pin: "2001" },
    { id: "5", name: "Bus Route 1", count: 35, description: "Route 1", pin: "3001" },
  ];

  const filteredGroups = useMemo(
    () => groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase())),
    [search]
  );

  const copyPin = async (pin: string) => {
    try {
      await navigator.clipboard.writeText(pin);
    } finally {
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 1500);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <SamplePageOverlay />

      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5">Manage Groups</Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage contact groups with PIN codes
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<Plus size={16} />}>
          New Group
        </Button>
      </Stack>

      {/* Quick Send Info */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Stack spacing={1}>
          <Typography variant="body2">
            <strong>Quick Send:</strong> Text{" "}
            <strong className="font-mono">+1 (833) 000-0000</strong> with PIN + message
          </Typography>
          <Typography variant="caption" className="font-mono">
            Example: <strong>1234</strong> School closes early today at 2pm
          </Typography>
        </Stack>
      </Alert>

      {/* Groups */}
      <Card>
        <CardHeader
          title="Contact Groups"
          subheader={`${groups.length} total groups`}
        />
        <CardContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Search groups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 3 }}
          />

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
                lg: "1fr 1fr 1fr",
              },
              gap: 2,
            }}
          >
            {filteredGroups.map((group) => (
              <Card key={group.id} variant="outlined">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Users size={28} />
                      <Chip label={group.count} size="small" />
                    </Stack>

                    <Box>
                      <Typography fontWeight={600}>{group.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {group.description}
                      </Typography>
                    </Box>

                    {/* PIN */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "divider",
                        bgcolor: "grey.50",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Hash size={14} />
                        <Typography variant="caption">PIN:</Typography>
                        <Typography
                          variant="body2"
                          fontFamily="monospace"
                          fontWeight={600}
                        >
                          {group.pin}
                        </Typography>
                      </Stack>

                      <Button
                        size="small"
                        variant="text"
                        onClick={() => copyPin(group.pin)}
                      >
                        {copiedPin === group.pin ? (
                          <Check size={14} color="green" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </Button>
                    </Box>

                    <Divider />

                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit2 size={14} />}
                        fullWidth
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Eye size={14} />}
                        fullWidth
                      >
                        View
                      </Button>
                    </Stack>

                    <Button
                      size="small"
                      variant="text"
                      startIcon={<UserPlus size={14} />}
                    >
                      Manage Members
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
