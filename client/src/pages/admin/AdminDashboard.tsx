import React from "react";
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import StorageIcon from "@mui/icons-material/Storage";
import SecurityIcon from "@mui/icons-material/Security";


import SamplePageOverlay from "../../components/samplePageOverlay"

type Stat = {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  change: string;
};

type ActivityType = "user" | "application" | "settings";

type Activity = {
  action: string;
  user: string;
  time: string;
  type: ActivityType;
};

type SystemStatusItem = {
  name: string;
  status: "operational";
  uptime: string;
};

const stats: Stat[] = [
  {
    label: "Total Users",
    value: "142",
    icon: PeopleIcon,
    color: "#1976d2",
    change: "+5 this month",
  },
  {
    label: "Active Students",
    value: "387",
    icon: SchoolIcon,
    color: "#388e3c",
    change: "+12 this week",
  },
  {
    label: "System Health",
    value: "98%",
    icon: CheckCircleIcon,
    color: "#43a047",
    change: "All systems operational",
  },
  {
    label: "Pending Actions",
    value: "7",
    icon: WarningIcon,
    color: "#f57c00",
    change: "Requires attention",
  },
];

const recentActivity: Activity[] = [
  {
    action: "New user registered",
    user: "Mrs. Rachel Cohen",
    time: "2 hours ago",
    type: "user",
  },
  {
    action: "Application submitted",
    user: "Sarah Goldstein",
    time: "3 hours ago",
    type: "application",
  },
  {
    action: "School settings updated",
    user: "Admin User",
    time: "1 day ago",
    type: "settings",
  },
  {
    action: "User role changed",
    user: "Mr. David Klein",
    time: "2 days ago",
    type: "user",
  },
  {
    action: "Email configuration updated",
    user: "Admin User",
    time: "3 days ago",
    type: "settings",
  },
];

const systemStatus: SystemStatusItem[] = [
  { name: "Database", status: "operational", uptime: "99.9%" },
  { name: "Email Service", status: "operational", uptime: "99.8%" },
  { name: "SMS Service", status: "operational", uptime: "99.5%" },
  { name: "File Storage", status: "operational", uptime: "100%" },
  { name: "Backup System", status: "operational", uptime: "100%" },
];

const AdminDashboard: React.FC = () => {
  return (
    <Box>
      {/* Stats */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "repeat(4, minmax(0, 1fr))",
          },
          gap: 3,
          mb: 4,
        }}
      >
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card elevation={2} key={stat.label}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 56,
                      height: 56,
                    }}
                  >
                    <Icon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: "bold", mb: 0.5 }}
                    >
                      {stat.value}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <TrendingUpIcon
                        sx={{ fontSize: 16, color: "success.main" }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {stat.change}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Middle: Recent Activity + System Status */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
          gap: 3,
        }}
      >
        {/* Recent Activity */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <NotificationsActiveIcon color="primary" />
            <Typography variant="h6">Recent Activity</Typography>
          </Stack>
          <List>
            {recentActivity.map((activity, index) => {
              const bgColor =
                activity.type === "user"
                  ? "#1976d2"
                  : activity.type === "application"
                  ? "#388e3c"
                  : "#f57c00";

              const Icon =
                activity.type === "user"
                  ? PeopleIcon
                  : activity.type === "application"
                  ? SchoolIcon
                  : SecurityIcon;

              return (
                <Box key={activity.action + index}>
                  <ListItem sx={{ px: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: bgColor,
                        width: 40,
                        height: 40,
                        mr: 2,
                      }}
                    >
                      <Icon />
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500 }}>
                          {activity.action}
                        </Typography>
                      }
                      secondary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                        >
                          <Typography variant="body2" color="text.secondary">
                            {activity.user}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • {activity.time}
                          </Typography>
                        </Stack>
                      }
                    />
                  </ListItem>
                  {index < recentActivity.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        </Paper>

        {/* System Status */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 3 }}
          >
            <StorageIcon color="primary" />
            <Typography variant="h6">System Status</Typography>
          </Stack>

          <Stack spacing={3}>
            {systemStatus.map((sys) => {
              const numeric = parseFloat(sys.uptime);

              return (
                <Box key={sys.name}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500 }}
                    >
                      {sys.name}
                    </Typography>
                    <Chip
                      label="Operational"
                      color="success"
                      size="small"
                      sx={{ height: 20, fontSize: "0.75rem" }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <LinearProgress
                      variant="determinate"
                      value={isNaN(numeric) ? 0 : numeric}
                      color="success"
                      sx={{ flex: 1, height: 6, borderRadius: 1 }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ minWidth: 45, textAlign: "right" }}
                    >
                      {sys.uptime}
                    </Typography>
                  </Stack>
                </Box>
              );
            })}
          </Stack>
        </Paper>
      </Box>

      {/* Quick Actions */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { boxShadow: 4 },
            }}
            // onClick={() => ...}
          >
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <PeopleIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                <Typography variant="body2" align="center">
                  Invite New User
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <SchoolIcon sx={{ fontSize: 40, color: "#388e3c" }} />
                <Typography variant="body2" align="center">
                  Manage Applications
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <SecurityIcon sx={{ fontSize: 40, color: "#f57c00" }} />
                <Typography variant="body2" align="center">
                  Security Settings
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          <Card
            sx={{
              cursor: "pointer",
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Stack alignItems="center" spacing={1}>
                <StorageIcon sx={{ fontSize: 40, color: "#7b1fa2" }} />
                <Typography variant="body2" align="center">
                  Backup Data
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Paper>
         <SamplePageOverlay text="SAMPLE PAGE" />
    </Box>
  );
};

export default AdminDashboard;

