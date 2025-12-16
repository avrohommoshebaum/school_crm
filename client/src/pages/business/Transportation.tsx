import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Divider,
} from "@mui/material";

import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";

import SamplePageOverlay from "../../components/samplePageOverlay";

interface Route {
  id: number;
  name: string;
  students: number;
  driver: string;
  monthlyFee: number;
  collectedThisMonth: number;
  totalExpected: number;
  stops: string[];
}

export default function Transportation() {
  const routes: Route[] = [
    {
      id: 1,
      name: "Route 1 - Westgate",
      students: 18,
      driver: "Mr. Levi",
      monthlyFee: 210,
      collectedThisMonth: 3780,
      totalExpected: 3780,
      stops: ["Main St & Oak", "Maple Ave", "School"],
    },
    {
      id: 2,
      name: "Route 2 - Downtown",
      students: 22,
      driver: "Mr. Cohen",
      monthlyFee: 210,
      collectedThisMonth: 4200,
      totalExpected: 4620,
      stops: ["Central Square", "Park Ave", "School"],
    },
    {
      id: 3,
      name: "Route 3 - North Side",
      students: 15,
      driver: "Mrs. Goldstein",
      monthlyFee: 210,
      collectedThisMonth: 3150,
      totalExpected: 3150,
      stops: ["Highland Rd", "Brook St", "School"],
    },
  ];

  const totalStudents = routes.reduce((sum, r) => sum + r.students, 0);
  const totalCollected = routes.reduce(
    (sum, r) => sum + r.collectedThisMonth,
    0
  );
  const totalExpected = routes.reduce(
    (sum, r) => sum + r.totalExpected,
    0
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography variant="h5">Transportation Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bus routes and transportation fees
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Route
        </Button>
      </Stack>

      {/* Stats */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <StatCard
          label="Total Routes"
          value={routes.length}
          icon={<DirectionsBusIcon color="primary" />}
        />
        <StatCard
          label="Students on Buses"
          value={totalStudents}
          icon={<PeopleIcon color="secondary" />}
        />
        <StatCard
          label="Collected (Month)"
          value={`$${totalCollected.toLocaleString()}`}
          icon={<DirectionsBusIcon color="success" />}
        />
        <StatCard
          label="Outstanding"
          value={`$${(totalExpected - totalCollected).toLocaleString()}`}
          icon={<DirectionsBusIcon color="warning" />}
        />
      </Stack>

      {/* Routes */}
      <Stack spacing={2}>
        {routes.map((route) => {
          const collectionRate = Math.round(
            (route.collectedThisMonth / route.totalExpected) * 100
          );

          return (
            <Card key={route.id}>
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <DirectionsBusIcon color="primary" />
                    <Typography fontWeight={600}>
                      {route.name}
                    </Typography>
                    <Chip
                      label={`${route.students} students`}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Driver: {route.driver}
                  </Typography>

                  {/* Stops */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocationOnIcon
                      fontSize="small"
                      color="disabled"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {route.stops.join(" → ")}
                    </Typography>
                  </Stack>

                  {/* Financials */}
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
                        label="Monthly Fee"
                        value={`$${route.monthlyFee}/student`}
                      />
                      <Info
                        label="Collected This Month"
                        value={`$${route.collectedThisMonth.toLocaleString()}`}
                      />
                      <Info
                        label="Collection Rate"
                        value={`${collectionRate}%`}
                        color={
                          route.collectedThisMonth >= route.totalExpected
                            ? "success.main"
                            : "warning.main"
                        }
                      />
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined">
                      View Students
                    </Button>
                    <Button size="small" variant="outlined">
                      Edit Route
                    </Button>
                    <Button size="small" variant="outlined">
                      Payment Status
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
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

function Info({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ color: color ?? "text.primary" }}>
        {value}
      </Typography>
    </Box>
  );
}
