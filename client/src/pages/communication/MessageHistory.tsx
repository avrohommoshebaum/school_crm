import { Mail, MessageSquare, Phone, Hash } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import SamplePageOverlay from "../../components/samplePageOverlay";

type MessageType = "email" | "sms" | "call";
type MessageStatus = "sent" | "completed";

type MessageHistoryItem = {
  id: number;
  type: MessageType;
  subject: string;
  date: string;
  recipients: number;
  status: MessageStatus;
  sentVia: string;
};

export default function MessageHistory() {
  const recentMessages: MessageHistoryItem[] = [
    { id: 1, type: "email", subject: "Monthly Tuition Reminder", date: "2024-11-24", recipients: 487, status: "sent", sentVia: "Web" },
    { id: 2, type: "sms", subject: "Early Dismissal Tomorrow", date: "2024-11-23", recipients: 487, status: "sent", sentVia: "PIN: 1001" },
    { id: 3, type: "call", subject: "Snow Day Announcement", date: "2024-11-20", recipients: 487, status: "completed", sentVia: "PIN: 1001" },
    { id: 4, type: "email", subject: "Parent-Teacher Conference", date: "2024-11-18", recipients: 487, status: "sent", sentVia: "Web" },
    { id: 5, type: "sms", subject: "Bus Route Change Notice", date: "2024-11-15", recipients: 35, status: "sent", sentVia: "PIN: 3001" },
    { id: 6, type: "email", subject: "Chanukah Program Invitation", date: "2024-11-12", recipients: 487, status: "sent", sentVia: "Web" },
    { id: 7, type: "call", subject: "Emergency School Closure", date: "2024-11-10", recipients: 487, status: "completed", sentVia: "Web" },
    { id: 8, type: "sms", subject: "Lunch Menu Update", date: "2024-11-08", recipients: 487, status: "sent", sentVia: "Web" },
    { id: 9, type: "email", subject: "Field Trip Permission Forms", date: "2024-11-05", recipients: 142, status: "sent", sentVia: "Web" },
    { id: 10, type: "call", subject: "School Delay Announcement", date: "2024-11-03", recipients: 487, status: "completed", sentVia: "PIN: 1001" },
  ];

  const renderIcon = (type: MessageType) => {
    switch (type) {
      case "email":
        return <Mail size={20} color="#1d4ed8" />;
      case "sms":
        return <MessageSquare size={20} color="#1d4ed8" />;
      case "call":
        return <Phone size={20} color="#1d4ed8" />;
    }
  };

  return (
    <>
      <SamplePageOverlay />

      <Box sx={{ maxWidth: 1100, mx: "auto", p: 2 }}>
        {/* Header */}
        <Box mb={3}>
          <Typography variant="h5" fontWeight={600}>
            Message History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all sent communications
          </Typography>
        </Box>

        <Card>
          <CardHeader
            title="All Messages"
            subheader="Complete history of sent emails, SMS, and robocalls"
          />

          <CardContent>
            <Stack spacing={2}>
              {recentMessages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    gap: 2,
                    "&:hover": { bgcolor: "grey.50" },
                  }}
                >
                  {/* Left */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "primary.light",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {renderIcon(msg.type)}
                    </Box>

                    <Box minWidth={0}>
                      <Typography fontWeight={500} noWrap>
                        {msg.subject}
                      </Typography>

                      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          {msg.date} • {msg.recipients} recipients
                        </Typography>

                        {msg.sentVia.startsWith("PIN") && (
                          <Chip
                            size="small"
                            icon={<Hash size={14} />}
                            label={msg.sentVia}
                            sx={{
                              bgcolor: "#f3e8ff",
                              color: "#6b21a8",
                              fontWeight: 500,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>

                  {/* Right */}
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent={{ sm: "flex-end" }}
                    flexWrap="wrap"
                  >
                    <Chip
                      label={msg.status}
                      color={msg.status === "completed" ? "success" : "primary"}
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                    <Chip
                      label={msg.type}
                      variant="outlined"
                      size="small"
                      sx={{ textTransform: "capitalize" }}
                    />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </>
  );
}
