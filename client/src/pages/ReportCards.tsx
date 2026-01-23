import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  Stack,
  Paper,
} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import SendIcon from '@mui/icons-material/Send';
import DownloadIcon from '@mui/icons-material/Download';
import type { JSX } from 'react';
import SamplePageOverlay from '../components/samplePageOverlay';


export default function ReportCards(): JSX.Element {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <SamplePageOverlay />
      {/* Page Header */}
      <Box>
        <Typography variant="h5" sx={{ mb: 0.5 }}>
          Report Cards
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create, manage, and distribute student report cards
        </Typography>
      </Box>

      {/* Action Cards */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
      >
        {/* Create */}
        <Card
          sx={{
            flex: 1,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          <CardHeader
            avatar={
              <Paper
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'primary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <DescriptionIcon color="primary" />
              </Paper>
            }
            title="Create Report Cards"
            subheader="Generate new report cards for students"
          />
          <CardContent>
            <Button variant="contained" fullWidth>
              Create New
            </Button>
          </CardContent>
        </Card>

        {/* Distribute */}
        <Card
          sx={{
            flex: 1,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          <CardHeader
            avatar={
              <Paper
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <SendIcon color="success" />
              </Paper>
            }
            title="Distribute Reports"
            subheader="Send report cards to parents via email"
          />
          <CardContent>
            <Button
              variant="contained"
              color="success"
              fullWidth
            >
              Send Reports
            </Button>
          </CardContent>
        </Card>

        {/* Download */}
        <Card
          sx={{
            flex: 1,
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            '&:hover': { boxShadow: 6 },
          }}
        >
          <CardHeader
            avatar={
              <Paper
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: 'secondary.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 2,
                }}
              >
                <DownloadIcon color="secondary" />
              </Paper>
            }
            title="Download Reports"
            subheader="Export report cards as PDF files"
          />
          <CardContent>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
            >
              Download
            </Button>
          </CardContent>
        </Card>
      </Stack>

      {/* Recent Reports */}
      <Card>
        <CardHeader title="Recent Report Cards" />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            No report cards created yet.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

