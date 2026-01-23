/**
 * Column Mapping Step Component
 * Allows users to map Excel columns to system fields
 */

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Grid,
} from '@mui/material';
import { sanitizeText } from '../../utils/sanitization';

interface ColumnMappingStepProps {
  headers: string[];
  sampleRows: string[][];
  onComplete: (mapping: Record<string, string>) => void;
  onCancel: () => void;
}

const REQUIRED_FIELDS = [
  { key: 'studentName', label: 'Student Name (Last, First)', required: true },
  { key: 'parentName', label: 'Parent Name (Last, First or "First and First")', required: true },
  { key: 'address', label: 'Home Address', required: true },
];

const OPTIONAL_FIELDS = [
  { key: 'homePhone', label: 'Home Phone' },
  { key: 'fatherCell', label: 'Father Cell' },
  { key: 'motherCell', label: 'Mother Cell' },
  { key: 'grade', label: 'Grade' },
  { key: 'class', label: 'Class' },
  { key: 'familyId', label: 'Family ID' },
  { key: 'busRoute', label: 'Bus Route' },
  { key: 'tuition', label: 'Tuition' },
  { key: 'pledges', label: 'Pledges' },
  { key: 'paid', label: 'Paid Amount' },
];

export default function ColumnMappingStep({
  headers,
  sampleRows,
  onComplete,
  onCancel,
}: ColumnMappingStepProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    // Auto-detect columns on mount
    const autoMapping: Record<string, string> = {};
    
    headers.forEach((header) => {
      const headerLower = sanitizeText(header).toLowerCase();
      
      // Student name detection
      if (!autoMapping.studentName) {
        if (headerLower.includes('student') && (headerLower.includes('name') || headerLower.includes('last'))) {
          autoMapping.studentName = header;
        } else if (headerLower.includes('last') && headerLower.includes('name') && !headerLower.includes('parent')) {
          autoMapping.studentName = header;
        }
      }
      
      // Parent name detection
      if (!autoMapping.parentName) {
        if (headerLower.includes('parent') && headerLower.includes('name')) {
          autoMapping.parentName = header;
        } else if (headerLower.includes('guardian')) {
          autoMapping.parentName = header;
        }
      }
      
      // Address detection
      if (!autoMapping.address) {
        if (headerLower.includes('address') || headerLower.includes('street')) {
          autoMapping.address = header;
        }
      }
      
      // Other fields
      if (!autoMapping.homePhone && (headerLower.includes('home') && headerLower.includes('phone'))) {
        autoMapping.homePhone = header;
      }
      if (!autoMapping.fatherCell && (headerLower.includes('father') && headerLower.includes('cell'))) {
        autoMapping.fatherCell = header;
      }
      if (!autoMapping.motherCell && (headerLower.includes('mother') && headerLower.includes('cell'))) {
        autoMapping.motherCell = header;
      }
      if (!autoMapping.grade && headerLower.includes('grade') && !headerLower.includes('point')) {
        autoMapping.grade = header;
      }
      if (!autoMapping.class && headerLower.includes('class') && !headerLower.includes('room')) {
        autoMapping.class = header;
      }
      if (!autoMapping.familyId && headerLower.includes('family') && headerLower.includes('id')) {
        autoMapping.familyId = header;
      }
      if (!autoMapping.busRoute && (headerLower.includes('bus') || headerLower.includes('route'))) {
        autoMapping.busRoute = header;
      }
      if (!autoMapping.tuition && headerLower.includes('tuition')) {
        autoMapping.tuition = header;
      }
      if (!autoMapping.pledges && headerLower.includes('pledge')) {
        autoMapping.pledges = header;
      }
      if (!autoMapping.paid && (headerLower.includes('paid') || headerLower.includes('payment'))) {
        autoMapping.paid = header;
      }
    });
    
    setMapping(autoMapping);
  }, [headers]);

  const handleMappingChange = (field: string, column: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: column === 'none' ? undefined : column,
    }));
  };

  const handleComplete = () => {
    // Validate required fields
    const missing = REQUIRED_FIELDS.filter(f => f.required && !mapping[f.key]);
    if (missing.length > 0) {
      alert(`Please map the following required fields: ${missing.map(f => f.label).join(', ')}`);
      return;
    }
    
    onComplete(mapping);
  };

  const isValid = REQUIRED_FIELDS.every(f => !f.required || mapping[f.key]);

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Map Excel Columns to Fields</Typography>
      
      <Alert severity="info">
        Map each Excel column to the corresponding system field. Required fields must be mapped.
      </Alert>

      {/* Required Fields */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Required Fields
        </Typography>
        <Grid container spacing={2}>
          {REQUIRED_FIELDS.map((field) => (
            <Grid xs={12} sm={6} key={field.key}>
              <FormControl fullWidth required>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={mapping[field.key] || 'none'}
                  label={field.label}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                >
                  <MenuItem value="none">None</MenuItem>
                  {headers.map((header) => (
                    <MenuItem key={header} value={header}>
                      {header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Optional Fields */}
      <Box>
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Optional Fields
        </Typography>
        <Grid container spacing={2}>
          {OPTIONAL_FIELDS.map((field) => (
            <Grid xs={12} sm={6} key={field.key}>
              <FormControl fullWidth>
                <InputLabel>{field.label}</InputLabel>
                <Select
                  value={mapping[field.key] || 'none'}
                  label={field.label}
                  onChange={(e) => handleMappingChange(field.key, e.target.value)}
                >
                  <MenuItem value="none">None</MenuItem>
                  {headers.map((header) => (
                    <MenuItem key={header} value={header}>
                      {header}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Preview */}
      {sampleRows.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Preview (First 5 Rows)
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableCell key={header} sx={{ fontWeight: 600 }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleRows.slice(0, 5).map((row, idx) => (
                  <TableRow key={idx}>
                    {headers.map((header, colIdx) => (
                      <TableCell key={colIdx}>
                        {sanitizeText(String(row[colIdx] || ''))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Actions */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button onClick={onCancel}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleComplete}
          disabled={!isValid}
        >
          Continue
        </Button>
      </Stack>
    </Stack>
  );
}

