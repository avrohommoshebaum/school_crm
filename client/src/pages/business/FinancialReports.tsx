import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AddIcon from "@mui/icons-material/Add";

import SamplePageOverlay from "../../components/samplePageOverlay";

interface FinancialReport {
  name: string;
  description: string;
  lastGenerated: string;
}

export default function FinancialReports() {
  const reports: FinancialReport[] = [
    {
      name: "Monthly Tuition Summary",
      description: "Overview of all tuition payments for the month",
      lastGenerated: "2024-11-01",
    },
    {
      name: "Outstanding Balances Report",
      description: "List of families with past-due balances",
      lastGenerated: "2024-11-25",
    },
    {
      name: "Donation Summary (YTD)",
      description: "Year-to-date donation summary by fund",
      lastGenerated: "2024-11-20",
    },
    {
      name: "Transportation Revenue",
      description: "Bus fee collection and route analysis",
      lastGenerated: "2024-11-15",
    },
    {
      name: "Tax Receipt Report",
      description: "Donation tax receipts for the year",
      lastGenerated: "2024-11-10",
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Box>
        <Typography variant="h5" gutterBottom>
          Financial Reports
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate and download financial reports
        </Typography>
      </Box>

      {/* Reports List */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        flexWrap="wrap"
      >
        {reports.map((report) => (
          <Card
            key={report.name}
            sx={{
              flex: "1 1 420px",
              transition: "box-shadow 0.2s",
              "&:hover": {
                boxShadow: 6,
              },
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                {/* Icon */}
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "primary.light",
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <DescriptionIcon color="primary" />
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={600} gutterBottom>
                    {report.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {report.description}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <CalendarTodayIcon sx={{ fontSize: 14 }} color="disabled" />
                    <Typography variant="caption" color="text.secondary">
                      Last generated: {report.lastGenerated}
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DescriptionIcon />}
                      sx={{ flex: 1 }}
                    >
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<DownloadIcon />}
                      sx={{ flex: 1 }}
                    >
                      Download
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Custom Report Generator */}
      <Card>
        <CardContent>
          <Typography fontWeight={600} gutterBottom>
            Custom Report Generator
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            Generate custom reports with specific date ranges and filters
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Button
            variant="contained"
            startIcon={<AddIcon />}
          >
            Create Custom Report
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
