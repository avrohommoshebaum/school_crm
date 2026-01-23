/**
 * Import Progress Step Component
 * Shows import progress and results
 */

import { Stack, Typography, Alert, Box, Button, CircularProgress, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

interface ImportProgressStepProps {
  result: any;
  loading: boolean;
  onReset: () => void;
}

export default function ImportProgressStep({
  result,
  loading,
  onReset,
}: ImportProgressStepProps) {
  if (loading) {
    return (
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <CircularProgress size={64} />
        <Typography variant="h6">Importing Data...</Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we import families, parents, and students.
        </Typography>
      </Stack>
    );
  }

  if (!result) {
    return (
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <ErrorIcon sx={{ fontSize: 64, color: 'error.main' }} />
        <Typography variant="h6" color="error">
          Import Failed
        </Typography>
        <Button variant="contained" onClick={onReset}>
          Try Again
        </Button>
      </Stack>
    );
  }

  const { imported = 0, errors = 0, details } = result;
  const total = imported + errors;
  const successRate = total > 0 ? ((imported / total) * 100).toFixed(1) : '0';

  return (
    <Stack spacing={3}>
      <Box textAlign="center">
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Import Complete!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Successfully imported {imported} record{imported !== 1 ? 's' : ''}
          {errors > 0 && ` with ${errors} error${errors !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {/* Stats */}
      <Stack direction="row" spacing={2} justifyContent="center">
        <Chip
          label={`${imported} Imported`}
          color="success"
          icon={<CheckCircleIcon />}
        />
        {errors > 0 && (
          <Chip
            label={`${errors} Errors`}
            color="error"
            icon={<ErrorIcon />}
          />
        )}
        <Chip
          label={`${successRate}% Success Rate`}
          color="primary"
        />
      </Stack>

      {/* Summary */}
      {details && (
        <Alert severity={errors === 0 ? 'success' : 'warning'}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Import Summary
          </Typography>
          <Typography variant="body2">
            • Families created/updated: {details.familiesCreated || 0}
            <br />
            • Parents created: {details.parentsCreated || 0}
            <br />
            • Students created: {details.studentsCreated || 0}
            {details.studentsUpdated > 0 && (
              <>
                <br />
                • Students updated/merged: {details.studentsUpdated || 0}
              </>
            )}
            <br />
            • Class assignments: {details.classAssignments || 0}
            {errors > 0 && (
              <>
                <br />
                • Rows with errors: {errors}
              </>
            )}
          </Typography>
        </Alert>
      )}

      {/* Error Details */}
      {details?.errors && details.errors.length > 0 && (
        <Alert severity="error">
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Errors ({details.errors.length})
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {details.errors.slice(0, 10).map((err: any, idx: number) => (
              <Typography key={idx} variant="caption" display="block">
                Row {err.row}: {err.error}
              </Typography>
            ))}
            {details.errors.length > 10 && (
              <Typography variant="caption" color="text.secondary">
                ... and {details.errors.length - 10} more errors
              </Typography>
            )}
          </Box>
        </Alert>
      )}

      <Stack direction="row" spacing={2} justifyContent="center">
        <Button variant="contained" onClick={onReset}>
          Import Another File
        </Button>
      </Stack>
    </Stack>
  );
}

