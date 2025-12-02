import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Stack,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SchoolIcon from '@mui/icons-material/School';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PublicIcon from '@mui/icons-material/Public';
import PaletteIcon from '@mui/icons-material/Palette';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import nachlasLogo from 'figma:asset/3c16d5f0732224e6e165b6ba5c1c139c68ed50c2.png';

export default function SchoolSettings() {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  const [schoolInfo, setSchoolInfo] = useState({
    name: 'Nachlas Bais Yaakov',
    hebrewName: 'נחלת בית יעקב',
    address: '213 Newport Ave',
    city: 'Lakewood',
    state: 'NJ',
    zipCode: '08701',
    phone: '(732) 555-1234',
    email: 'info@nachlasbaisyaakov.org',
    website: 'www.nachlasbaisyaakov.org',
    principalName: 'Mrs. Sarah Goldstein',
    principalEmail: 'principal@nachlasbaisyaakov.org',
    timezone: 'America/New_York',
    language: 'en',
  });

  const [branding, setBranding] = useState({
    primaryColor: '#1976d2',
    secondaryColor: '#388e3c',
    accentColor: '#f57c00',
  });

  const handleSave = () => {
    // TODO: API call to save school settings
    setSnackbar({ open: true, message: 'School settings saved successfully!', severity: 'success' });
  };

  const handleLogoUpload = () => {
    // TODO: Implement logo upload functionality
    setSnackbar({ open: true, message: 'Logo upload functionality coming soon!', severity: 'success' });
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mb: 3,
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
            School Settings
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Manage your school's information, branding, and configuration
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Logo & Branding Card */}
        <Grid item xs={12} lg={4}>
          <Card elevation={3} sx={{ height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Section Header */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box 
                    sx={{ 
                      bgcolor: '#1976d2', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PaletteIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Logo & Branding
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Customize your school's visual identity
                    </Typography>
                  </Box>
                </Stack>

                <Divider />

                {/* Logo Upload */}
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                    }}
                  >
                    <Avatar
                      src={nachlasLogo}
                      sx={{
                        width: { xs: 120, sm: 150 },
                        height: { xs: 120, sm: 150 },
                        border: '4px solid #e0e0e0',
                        boxShadow: 2,
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: '#1976d2',
                        color: 'white',
                        boxShadow: 2,
                        '&:hover': { 
                          bgcolor: '#1565c0',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={handleLogoUpload}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Click camera to upload new logo
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Recommended: 500×500px, PNG/JPG
                  </Typography>
                </Box>

                {/* Brand Colors */}
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                    Brand Colors
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          fullWidth
                          label="Primary"
                          type="color"
                          value={branding.primaryColor}
                          onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                          size="small"
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: branding.primaryColor,
                            border: '2px solid #e0e0e0',
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          fullWidth
                          label="Secondary"
                          type="color"
                          value={branding.secondaryColor}
                          onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                          size="small"
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: branding.secondaryColor,
                            border: '2px solid #e0e0e0',
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Box>
                    <Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <TextField
                          fullWidth
                          label="Accent"
                          type="color"
                          value={branding.accentColor}
                          onChange={(e) => setBranding({ ...branding, accentColor: e.target.value })}
                          size="small"
                        />
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            bgcolor: branding.accentColor,
                            border: '2px solid #e0e0e0',
                            flexShrink: 0,
                          }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                </Box>

                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  size="small"
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Reset to Default
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Information Cards */}
        <Grid item xs={12} lg={8}>
          <Stack spacing={3}>
            {/* School Information Card */}
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#388e3c', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      School Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Basic details about your institution
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="School Name (English)"
                      value={schoolInfo.name}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, name: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="School Name (Hebrew)"
                      value={schoolInfo.hebrewName}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, hebrewName: e.target.value })}
                      inputProps={{ style: { direction: 'rtl' } }}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Address Card */}
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#f57c00', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocationOnIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Address
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Physical location information
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Street Address"
                      value={schoolInfo.address}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, address: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      label="City"
                      value={schoolInfo.city}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, city: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <TextField
                      fullWidth
                      label="State"
                      value={schoolInfo.state}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, state: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      fullWidth
                      label="ZIP Code"
                      value={schoolInfo.zipCode}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, zipCode: e.target.value })}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#7b1fa2', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ContactPhoneIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      How people can reach your school
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      value={schoolInfo.phone}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, phone: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      type="email"
                      value={schoolInfo.email}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, email: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Website"
                      value={schoolInfo.website}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, website: e.target.value })}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Administration Card */}
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#d32f2f', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <AdminPanelSettingsIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Administration
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Principal and administrative contacts
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Principal Name"
                      value={schoolInfo.principalName}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, principalName: e.target.value })}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Principal Email"
                      type="email"
                      value={schoolInfo.principalEmail}
                      onChange={(e) => setSchoolInfo({ ...schoolInfo, principalEmail: e.target.value })}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Regional Settings Card */}
            <Card elevation={3}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                  <Box 
                    sx={{ 
                      bgcolor: '#0097a7', 
                      color: 'white', 
                      p: 1, 
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PublicIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Regional Settings
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Timezone and language preferences
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2.5}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Timezone</InputLabel>
                      <Select
                        value={schoolInfo.timezone}
                        label="Timezone"
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, timezone: e.target.value })}
                      >
                        <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                        <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                        <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                        <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                        <MenuItem value="America/Phoenix">Arizona (MST)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Default Language</InputLabel>
                      <Select
                        value={schoolInfo.language}
                        label="Default Language"
                        onChange={(e) => setSchoolInfo({ ...schoolInfo, language: e.target.value })}
                      >
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="he">Hebrew</MenuItem>
                        <MenuItem value="yi">Yiddish</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 2, sm: 3 }, 
          mt: 3,
          position: 'sticky',
          bottom: 0,
          bgcolor: 'background.paper',
          zIndex: 10,
          borderTop: '3px solid #1976d2',
        }}
      >
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems="center" 
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Last saved: Never
          </Typography>
          <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            <Button 
              variant="outlined" 
              size="large"
              fullWidth={isMobile}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              fullWidth={isMobile}
              sx={{ minWidth: 160 }}
            >
              Save Changes
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}