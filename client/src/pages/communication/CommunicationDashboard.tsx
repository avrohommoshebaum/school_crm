import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  MessageSquare,
  Phone,
  Users,
  Clock,
  Smartphone,
  Hash,
  ArrowRight,
} from "lucide-react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  CircularProgress,
  Link,
  useTheme,
} from "@mui/material";

import api from "../../utils/api";

// ---------- Types ----------

interface DashboardStats {
  messagesSentToday: number;
  activeRecipients: number;
  totalGroups: number;
  messagesThisMonth: number;
}

interface RecentActivity {
  id: string;
  title: string;
  date: string;
  recipients: number;
  type: "email" | "sms" | "call";
}

interface Group {
  id: string;
  _id?: string;
  name: string;
  pin?: string;
  memberCount?: number;
  member_count?: number;
}

// ---------- Component ----------

export default function CommunicationDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    messagesSentToday: 0,
    activeRecipients: 0,
    totalGroups: 0,
    messagesThisMonth: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  // ---------- Load Data ----------

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load groups
        const groupsRes = await api.get("/groups");
        const groupsData = groupsRes.data.groups || [];
        setGroups(groupsData);

        // Calculate active recipients (sum of all group members)
        const activeRecipients = groupsData.reduce(
          (sum: number, g: Group) => sum + (g.memberCount || g.member_count || 0),
          0
        );

        // Load recent messages
        const [smsRes, emailRes] = await Promise.all([
          api.get("/sms/history", { params: { page: 1, limit: 10 } }).catch(() => ({ data: { messages: [] } })),
          api.get("/email/history", { params: { page: 1, limit: 10 } }).catch(() => ({ data: { messages: [] } })),
        ]);

        const smsMessages = smsRes.data.messages || [];
        const emailMessages = emailRes.data.messages || [];

        // Transform to recent activity
        const activities: RecentActivity[] = [
          ...emailMessages.slice(0, 5).map((msg: any) => ({
            id: msg.id || msg._id,
            title: msg.subject || "Email Message",
            date: msg.created_at || msg.sent_at,
            recipients: msg.recipient_count || 0,
            type: "email" as const,
          })),
          ...smsMessages.slice(0, 5).map((msg: any) => ({
            id: msg.id || msg._id,
            title: msg.message?.substring(0, 50) || "SMS Message",
            date: msg.created_at || msg.sent_at,
            recipients: msg.recipient_count || msg.recipient_phone_numbers?.length || 0,
            type: "sms" as const,
          })),
        ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);

        setRecentActivity(activities);

        // Calculate stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const messagesToday = [
          ...emailMessages.filter((msg: any) => {
            const msgDate = new Date(msg.created_at || msg.sent_at);
            return msgDate >= today;
          }),
          ...smsMessages.filter((msg: any) => {
            const msgDate = new Date(msg.created_at || msg.sent_at);
            return msgDate >= today;
          }),
        ].length;

        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const messagesThisMonth = [
          ...emailMessages.filter((msg: any) => {
            const msgDate = new Date(msg.created_at || msg.sent_at);
            return msgDate >= thisMonth;
          }),
          ...smsMessages.filter((msg: any) => {
            const msgDate = new Date(msg.created_at || msg.sent_at);
            return msgDate >= thisMonth;
          }),
        ].length;

        setStats({
          messagesSentToday: messagesToday,
          activeRecipients,
          totalGroups: groupsData.length,
          messagesThisMonth,
        });
      } catch (error: any) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // ---------- Get Icon for Activity Type ----------

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail size={20} />;
      case "sms":
        return <MessageSquare size={20} />;
      case "call":
        return <Phone size={20} />;
      default:
        return <Mail size={20} />;
    }
  };

  // ---------- Format Date ----------

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 1400, mx: "auto" }}>
      {/* Quick Send Bar */}
      <Card
        sx={{
          mb: 3,
          bgcolor: "info.50",
          border: "1px solid",
          borderColor: "info.200",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
              <Smartphone size={20} color={theme.palette.info.main} />
              <Box>
                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                  Quick Send: Text <strong>+1 (833) 000-0000</strong> with PIN + message for instant mass
                  communications
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Example: <strong>1234</strong> School closes early today at 2pm
                </Typography>
              </Box>
            </Stack>
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate("/communication/groups")}
              sx={{
                color: "primary.main",
                textDecoration: "none",
                fontWeight: 600,
                "&:hover": { textDecoration: "underline" },
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              View PINs <ArrowRight size={16} />
            </Link>
          </Stack>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        {[
          {
            title: "Messages Sent Today",
            value: stats.messagesSentToday,
            icon: Mail,
            color: "primary",
          },
          {
            title: "Active Recipients",
            value: stats.activeRecipients,
            icon: Users,
            color: "success",
          },
          {
            title: "Total Groups",
            value: stats.totalGroups,
            icon: Users,
            color: "secondary",
          },
          {
            title: "This Month",
            value: stats.messagesThisMonth,
            icon: Clock,
            color: "warning",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} sx={{ flex: 1, minWidth: { xs: "100%", sm: 200 } }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      bgcolor: `${stat.color}.50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={24} color={theme.palette[stat.color as keyof typeof theme.palette].main} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {stat.title}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {/* Quick Actions */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Card
            sx={{
              flex: 1,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
            onClick={() => navigate("/communication/quick-compose")}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Mail size={32} color="white" />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Compose Message
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Send a new email, SMS, or robocall
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
            onClick={() => navigate("/communication/history")}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "secondary.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Clock size={32} color="white" />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                View History
              </Typography>
              <Typography variant="body2" color="text.secondary">
                See all sent communications
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: 4,
              },
            }}
            onClick={() => navigate("/communication/groups")}
          >
            <CardContent sx={{ p: 4, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "success.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Users size={32} color="white" />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                Manage Groups
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create and edit contact groups with PINs
              </Typography>
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Recent Activity */}
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Recent Activity
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate("/communication/history")}
            sx={{
              color: "primary.main",
              textDecoration: "none",
              fontWeight: 600,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View all
          </Link>
        </Stack>

        <Card>
          <CardContent sx={{ p: 0 }}>
            {recentActivity.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No recent activity
                </Typography>
              </Box>
            ) : (
              <Stack>
                {recentActivity.map((activity, index) => (
                  <Box
                    key={activity.id}
                    sx={{
                      p: 2.5,
                      borderBottom: index < recentActivity.length - 1 ? 1 : 0,
                      borderColor: "divider",
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          bgcolor: "info.50",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={500} noWrap>
                          {activity.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(activity.date)} • {activity.recipients} recipient
                          {activity.recipients !== 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

