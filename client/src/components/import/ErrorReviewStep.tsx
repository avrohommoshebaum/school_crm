/**
 * Error Review Step Component
 * Allows users to review and fix validation errors before importing
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface DuplicateInfo {
  row: number;
  studentName: string;
  duplicates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    studentId?: string;
    dateOfBirth?: string;
    gradeName?: string;
    familyName?: string;
    enrollmentStatus?: string;
    similarityScore: number;
  }>;
  action: 'create' | 'merge' | 'update' | null;
}

interface ErrorReviewStepProps {
  errors: Array<{ row: number; errors?: string[]; error?: string; warnings?: string[]; data?: any }>;
  warnings?: Array<{ row: number; warnings: string[] }>;
  duplicates?: Array<DuplicateInfo>;
  details?: {
    totalRows?: number;
    validRows?: number;
    invalidRows?: number;
    totalErrors?: number;
    totalWarnings?: number;
    totalDuplicates?: number;
  };
  columnMapping: Record<string, string>;
  onFix: (mapping: Record<string, string>) => void;
  onImport: (duplicateActions?: Record<string, string>) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ErrorReviewStep({
  errors,
  warnings = [],
  duplicates = [],
  details,
  columnMapping,
  onFix,
  onImport,
  onCancel,
  loading,
}: ErrorReviewStepProps) {
  const [showErrors, setShowErrors] = useState(true);
  const [showWarnings, setShowWarnings] = useState(true);
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [activeTab, setActiveTab] = useState<'errors' | 'warnings' | 'duplicates'>('errors');
  const [duplicateActions, setDuplicateActions] = useState<Record<string, string>>({});

  const totalErrors = errors.length;
  const totalWarnings = warnings.length;
  const totalDuplicates = duplicates.length;
  const hasErrors = totalErrors > 0;
  const hasWarnings = totalWarnings > 0;
  const hasDuplicates = totalDuplicates > 0;
  
  // Initialize duplicate actions
  useState(() => {
    const actions: Record<string, string> = {};
    duplicates.forEach(dup => {
      actions[dup.studentName] = dup.action || 'create';
    });
    setDuplicateActions(actions);
  });

  if (!hasErrors && !hasWarnings && !hasDuplicates) {
    return (
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
        <Typography variant="h6" color="success.main">
          No Errors Found!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          All rows passed validation. Ready to import.
          {details && (
            <>
              <br />
              {details.validRows} of {details.totalRows} rows are valid.
            </>
          )}
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button onClick={onCancel}>Cancel</Button>
          <Button variant="contained" onClick={onImport} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Import Data'}
          </Button>
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Summary Alert */}
      <Alert severity={hasErrors ? "error" : "warning"} icon={<WarningIcon />}>
        <Typography variant="subtitle2" fontWeight={600}>
          {hasErrors ? `${totalErrors} error${totalErrors !== 1 ? 's' : ''} found` : 'Validation Complete'}
          {hasWarnings && ` • ${totalWarnings} warning${totalWarnings !== 1 ? 's' : ''}`}
          {hasDuplicates && ` • ${totalDuplicates} potential duplicate${totalDuplicates !== 1 ? 's' : ''}`}
        </Typography>
        <Typography variant="body2">
          {hasErrors 
            ? 'Please review the errors below. Rows with errors will be skipped during import.'
            : 'All rows passed validation. You may review warnings below before importing.'}
          {details && (
            <>
              <br />
              <strong>{details.validRows}</strong> of <strong>{details.totalRows}</strong> rows are valid.
            </>
          )}
        </Typography>
      </Alert>

      {/* Tabs for Errors, Warnings, and Duplicates */}
      {(hasErrors || hasWarnings || hasDuplicates) && (
        <Box>
          <Stack direction="row" spacing={1} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            {hasErrors && (
              <Button
                onClick={() => setActiveTab('errors')}
                variant={activeTab === 'errors' ? 'contained' : 'text'}
                color={activeTab === 'errors' ? 'error' : 'inherit'}
                sx={{ borderRadius: 0 }}
              >
                Errors ({totalErrors})
              </Button>
            )}
            {hasWarnings && (
              <Button
                onClick={() => setActiveTab('warnings')}
                variant={activeTab === 'warnings' ? 'contained' : 'text'}
                color={activeTab === 'warnings' ? 'warning' : 'inherit'}
                sx={{ borderRadius: 0 }}
              >
                Warnings ({totalWarnings})
              </Button>
            )}
            {hasDuplicates && (
              <Button
                onClick={() => setActiveTab('duplicates')}
                variant={activeTab === 'duplicates' ? 'contained' : 'text'}
                color={activeTab === 'duplicates' ? 'info' : 'inherit'}
                sx={{ borderRadius: 0 }}
              >
                Duplicates ({totalDuplicates})
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* Errors Table */}
      {hasErrors && activeTab === 'errors' && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Validation Errors
            </Typography>
            <Button
              size="small"
              onClick={() => setShowErrors(!showErrors)}
            >
              {showErrors ? 'Hide' : 'Show'} Errors
            </Button>
          </Stack>

          {showErrors && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Errors</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Warnings</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Data Preview</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {errors.slice(0, 50).map((err, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip label={`Row ${err.row}`} size="small" color="error" />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {(err.errors || (err.error ? [err.error] : [])).map((errorMsg, i) => (
                            <Typography key={i} variant="body2" color="error" sx={{ fontSize: '0.75rem' }}>
                              • {errorMsg}
                            </Typography>
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {err.warnings && err.warnings.length > 0 ? (
                          <Stack spacing={0.5}>
                            {err.warnings.map((warning, i) => (
                              <Typography key={i} variant="caption" color="warning.main" sx={{ fontSize: '0.7rem' }}>
                                • {warning}
                              </Typography>
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">—</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                          {err.data ? (
                            <>
                              Student: {err.data.studentName || '—'}<br />
                              Parent: {err.data.parentName || '—'}<br />
                              Grade: {err.data.grade || '—'} | Class: {err.data.class || '—'}
                            </>
                          ) : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {errors.length > 50 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <Typography variant="body2" color="text.secondary">
                          ... and {errors.length - 50} more errors
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Warnings Table */}
      {hasWarnings && activeTab === 'warnings' && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              Validation Warnings
            </Typography>
            <Button
              size="small"
              onClick={() => setShowWarnings(!showWarnings)}
            >
              {showWarnings ? 'Hide' : 'Show'} Warnings
            </Button>
          </Stack>

          {showWarnings && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Row</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Warnings</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {warnings.slice(0, 50).map((warn, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Chip label={`Row ${warn.row}`} size="small" color="warning" />
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {warn.warnings.map((warning, i) => (
                            <Typography key={i} variant="body2" color="warning.main" sx={{ fontSize: '0.75rem' }}>
                              • {warning}
                            </Typography>
                          ))}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {warnings.length > 50 && (
                    <TableRow>
                      <TableCell colSpan={2} align="center">
                        <Typography variant="body2" color="text.secondary">
                          ... and {warnings.length - 50} more warnings
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="outlined"
          onClick={() => onFix(columnMapping)}
          disabled={loading}
        >
          Fix Mappings
        </Button>
        <Button
          variant="contained"
          onClick={onImport}
          disabled={loading}
          color={hasErrors ? "error" : "primary"}
        >
          {loading ? <CircularProgress size={20} /> : hasErrors ? 'Import Valid Rows Only' : 'Import All Data'}
        </Button>
      </Stack>
    </Stack>
  );
}

