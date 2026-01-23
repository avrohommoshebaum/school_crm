import { useState, type JSX } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  Divider,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Chip,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckIcon from '@mui/icons-material/Check';

import SamplePageOverlay from '../components/samplePageOverlay';

export default function ApplicationForm(): JSX.Element {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  const steps = [
    { number: 1, title: 'Student Info' },
    { number: 2, title: 'Family Info' },
    { number: 3, title: 'Medical Info' },
    { number: 4, title: 'References' },
    { number: 5, title: 'Review & Submit' },
  ];

  const nextStep = () => currentStep < totalSteps && setCurrentStep(s => s + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(s => s - 1);

  /* ============================
     Render
  ============================ */

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 6 }}>
      <SamplePageOverlay />
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <Button
          variant="text"
          onClick={() => navigate('/applications')}
          sx={{ minWidth: 0 }}
        >
          <ArrowBackIcon />
        </Button>

        <Box>
          <Typography variant="h5">New Student Application</Typography>
          <Typography variant="body2" color="text.secondary">
            Nachlas Bais Yaakov – School Year 2024–2025
          </Typography>
        </Box>
      </Stack>

      {/* Step Indicator */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {steps.map((step, index) => {
              const isComplete = currentStep > step.number;
              const isActive = currentStep === step.number;

              return (
                <Stack key={step.number} direction="row" alignItems="center">
                  <Stack alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: isComplete
                          ? 'success.main'
                          : isActive
                          ? 'primary.main'
                          : 'grey.300',
                        color: isComplete || isActive ? '#fff' : 'text.secondary',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isComplete ? <CheckIcon fontSize="small" /> : step.number}
                    </Box>

                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        display: { xs: 'none', sm: 'block' },
                        color: isActive ? 'primary.main' : 'text.secondary',
                      }}
                    >
                      {step.title}
                    </Typography>
                  </Stack>

                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        width: { xs: 40, sm: 80 },
                        height: 2,
                        mx: 2,
                        bgcolor: isComplete ? 'success.main' : 'grey.300',
                      }}
                    />
                  )}
                </Stack>
              );
            })}
          </Stack>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader
          title={steps[currentStep - 1].title}
          subheader={`Step ${currentStep} of ${totalSteps}`}
        />
        <CardContent>
          <Stack spacing={4}>

            {/* STEP 1 */}
            {currentStep === 1 && (
              <>
                <Stack spacing={3}>
                  <Typography fontWeight={500}>Student Information</Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="First Name (English)" required fullWidth />
                    <TextField label="Last Name (English)" required fullWidth />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="First Name (Hebrew)" fullWidth inputProps={{ dir: 'rtl' }} />
                    <TextField label="Last Name (Hebrew)" fullWidth inputProps={{ dir: 'rtl' }} />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Nickname" fullWidth />
                    <TextField label="Date of Birth" type="date" required fullWidth InputLabelProps={{ shrink: true }} />
                  </Stack>
                </Stack>

                <Divider />

                <Stack spacing={3}>
                  <Typography fontWeight={500}>Enrollment Information</Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Select fullWidth displayEmpty>
                      <MenuItem value="">Applying for Grade</MenuItem>
                      {[1,2,3,4,5,6,7,8].map(g => (
                        <MenuItem key={g} value={g}>{`${g} Grade`}</MenuItem>
                      ))}
                    </Select>
                    <TextField label="Current School" fullWidth />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField label="Current Teacher" fullWidth />
                    <TextField label="Teacher Phone" fullWidth />
                  </Stack>
                </Stack>
              </>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <>
                <Typography fontWeight={500}>Address</Typography>

                <TextField label="Street Address" required fullWidth />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="City" required fullWidth />
                  <TextField label="State" required fullWidth />
                  <TextField label="ZIP Code" required fullWidth />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Neighborhood" fullWidth />
                  <TextField label="Home Phone" required fullWidth />
                </Stack>

                <Divider />

                <Typography fontWeight={500}>Mother Information</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Full Name" required fullWidth />
                  <TextField label="Cell Phone" required fullWidth />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Email" required fullWidth />
                  <TextField label="Occupation" fullWidth />
                </Stack>

                <Divider />

                <Typography fontWeight={500}>Father Information</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Full Name" required fullWidth />
                  <TextField label="Cell Phone" required fullWidth />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Email" required fullWidth />
                  <TextField label="Occupation" fullWidth />
                </Stack>

                <Divider />

                <Select fullWidth displayEmpty>
                  <MenuItem value="">Parental Marital Status</MenuItem>
                  {['Married','Divorced','Widowed','Separated'].map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </Select>
              </>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <>
                <Typography fontWeight={500}>Health Information</Typography>

                <TextField label="Allergies" fullWidth />
                <TextField label="Medications" fullWidth />
                <TextField label="Health Conditions" multiline rows={3} fullWidth />
                <TextField label="Emergency Notes" multiline rows={3} fullWidth />

                <Divider />

                <Typography fontWeight={500}>Doctor & Insurance</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Doctor Name" fullWidth />
                  <TextField label="Doctor Phone" fullWidth />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Insurance Carrier" fullWidth />
                  <TextField label="Policy Number" fullWidth />
                </Stack>

                <FormControlLabel
                  control={<Checkbox />}
                  label="Student has special needs requiring accommodation"
                />

                <TextField
                  label="Special Needs Description"
                  multiline
                  rows={4}
                  fullWidth
                />
              </>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <>
                <Typography fontWeight={500}>Shul & Rav</Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Shul Name" required fullWidth />
                  <TextField label="Affiliation" fullWidth />
                </Stack>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField label="Rav Name" fullWidth />
                  <TextField label="Rav Phone" fullWidth />
                </Stack>

                <Divider />

                <Typography fontWeight={500}>Family References</Typography>

                {[1, 2].map(n => (
                  <Card key={n} variant="outlined">
                    <CardContent>
                      <Typography fontWeight={500} mb={2}>
                        Reference {n}
                      </Typography>
                      <Stack spacing={2}>
                        <TextField label="Name" fullWidth />
                        <TextField label="Phone" fullWidth />
                        <TextField label="Relationship" fullWidth />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}

                <TextField
                  label="Families You Know at Nachlas BY"
                  multiline
                  rows={3}
                  fullWidth
                />
              </>
            )}

            {/* STEP 5 */}
            {currentStep === 5 && (
              <>
                <Card sx={{ bgcolor: 'blue.50' }}>
                  <CardContent>
                    <Typography fontWeight={500} color="primary">
                      Application Fee – $175
                    </Typography>
                    <FormControlLabel
                      control={<Checkbox />}
                      label="I agree to pay the $175 application fee"
                    />
                  </CardContent>
                </Card>

                <Divider />

                <Typography fontWeight={500}>Signature</Typography>

                <TextField label="Parent/Guardian Signature" required fullWidth />
                <TextField
                  label="Today's Date"
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  disabled
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Card variant="outlined">
                  <CardContent>
                    {[
                      'I certify the information is accurate',
                      'I agree to school policies',
                      'I consent to reference checks',
                    ].map(text => (
                      <FormControlLabel
                        key={text}
                        control={<Checkbox />}
                        label={text}
                      />
                    ))}
                  </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'success.50' }}>
                  <CardContent>
                    <Typography color="success.main" fontWeight={500}>
                      Ready to Submit
                    </Typography>
                    <Typography variant="body2">
                      Please review all information before submitting.
                    </Typography>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Navigation */}
            <Divider />

            <Stack direction="row" justifyContent="space-between">
              <Button variant="outlined" onClick={prevStep} disabled={currentStep === 1}>
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button variant="contained" onClick={nextStep}>
                  Next Step
                </Button>
              ) : (
                <Button variant="contained" color="success">
                  Submit Application
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

