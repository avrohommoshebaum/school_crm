/**
 * Family and Student Bulk Import Page
 * Comprehensive import system for families, parents, and students
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { usePermissions } from '../../hooks/usePermissions';
import ColumnMappingStep from '../../components/import/ColumnMappingStep';
import ErrorReviewStep from '../../components/import/ErrorReviewStep';
import ImportProgressStep from '../../components/import/ImportProgressStep';

const STEPS = ['Upload File', 'Map Columns', 'Review Errors', 'Import'];

export default function FamilyStudentImport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rolesArray = Array.isArray(user?.roles) ? user.roles : [];
  const { can, isAdmin } = usePermissions({ roles: rolesArray as any });
  
  // Check permissions
  const hasPermission = isAdmin || can('students', 'create');
  
  const [activeStep, setActiveStep] = useState(0);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelHeaders, setExcelHeaders] = useState<string[]>([]);
  const [sampleRows, setSampleRows] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [validationErrors, setValidationErrors] = useState<Array<{row: number; errors?: string[]; error?: string; warnings?: string[]; data?: any}>>([]);
  const [validationWarnings, setValidationWarnings] = useState<Array<{row: number; warnings: string[]}>>([]);
  const [validationDetails, setValidationDetails] = useState<any>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      navigate('/business-office', { replace: true });
    }
  }, [hasPermission, navigate]);

  if (!hasPermission) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">
          You do not have permission to import families and students.
        </Alert>
      </Box>
    );
  }

  const handleFileSelect = async (file: File) => {
    try {
      setLoading(true);
      setError(null);
      setExcelFile(file);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/import/parse', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setExcelHeaders(response.data.headers || []);
      setSampleRows(response.data.sampleRows || []);
      setActiveStep(1);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to parse Excel file');
      setExcelFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleColumnMappingComplete = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
    setActiveStep(2);
    validateImport(mapping);
  };

  const validateImport = async (mapping: Record<string, string>) => {
    if (!excelFile) return;

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('columnMapping', JSON.stringify(mapping));
      formData.append('reviewErrors', 'true');

      const response = await api.post('/import/families-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Always set validation data
      setValidationErrors(response.data.errors || []);
      setValidationWarnings(response.data.warnings || []);
      setValidationDetails(response.data.details || null);
      
      // If there are errors, show review step
      if (response.data.hasErrors || !response.data.valid) {
        // Stay on review step to show errors
        return;
      }
      
      // If there are only warnings, show review step but allow import
      if (response.data.warnings && response.data.warnings.length > 0) {
        // Stay on review step to show warnings, user can proceed
        return;
      }
      
      // No errors or warnings, proceed directly to import
      handleImport(mapping);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to validate import');
    } finally {
      setLoading(false);
    }
  };

  const handleErrorFix = (fixedMapping: Record<string, string>) => {
    setColumnMapping(fixedMapping);
    validateImport(fixedMapping);
  };

  const handleImport = async (mapping?: Record<string, string>) => {
    if (!excelFile) return;

    try {
      setLoading(true);
      setError(null);
      setActiveStep(3);

      const formData = new FormData();
      formData.append('file', excelFile);
      formData.append('columnMapping', JSON.stringify(mapping || columnMapping));
      formData.append('reviewErrors', 'false');

      const response = await api.post('/import/families-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImportResult(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to import data');
      setActiveStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setExcelFile(null);
    setExcelHeaders([]);
    setSampleRows([]);
    setColumnMapping({});
    setValidationErrors([]);
    setValidationWarnings([]);
    setValidationDetails(null);
    setImportResult(null);
    setError(null);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Bulk Import Families & Students
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Import families, parents, and students from Excel spreadsheet
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <Paper sx={{ p: 2 }}>
          <Stepper activeStep={activeStep}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {/* Step Content */}
        <Card>
          <CardContent>
            {activeStep === 0 && (
              <UploadStep
                onFileSelect={handleFileSelect}
                loading={loading}
              />
            )}

            {activeStep === 1 && (
              <ColumnMappingStep
                headers={excelHeaders}
                sampleRows={sampleRows}
                onComplete={handleColumnMappingComplete}
                onCancel={handleReset}
              />
            )}

            {activeStep === 2 && (
              <ErrorReviewStep
                errors={validationErrors}
                warnings={validationWarnings}
                duplicates={validationDetails?.duplicates || []}
                details={validationDetails}
                columnMapping={columnMapping}
                onFix={handleErrorFix}
                onImport={handleImport}
                onCancel={handleReset}
                loading={loading}
              />
            )}

            {activeStep === 3 && (
              <ImportProgressStep
                result={importResult}
                loading={loading}
                onReset={handleReset}
              />
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

// Upload Step Component
function UploadStep({ onFileSelect, loading }: { onFileSelect: (file: File) => void; loading: boolean }) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
      <UploadFileIcon sx={{ fontSize: 64, color: 'primary.main' }} />
      <Typography variant="h6">Upload Excel File</Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Upload an Excel file (.xlsx, .xls) or CSV file with family and student data.
        <br />
        Required columns: Student Name, Parent Name, Address
      </Typography>
      <Button
        variant="contained"
        component="label"
        startIcon={loading ? <CircularProgress size={20} /> : <UploadFileIcon />}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Choose File'}
        <input
          type="file"
          hidden
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
      </Button>
    </Stack>
  );
}

