import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Alert,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Collapse,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FilterListIcon from "@mui/icons-material/FilterList";
import api from "../utils/api";
import { exportTableData } from "../utils/excelExport";
import type { ExportColumn } from "../utils/excelExport";
import FamilyDetailDialog from "../components/dialogs/FamilyDetailDialog";

interface Family {
  id: string;
  familyName: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  studentCount?: number;
  parentCount?: number;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  { key: "familyName", label: "Family Name" },
  { key: "address", label: "Address" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zipCode", label: "Zip Code" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "studentCount", label: "Students", format: (v) => String(v ?? 0) },
  { key: "parentCount", label: "Parents", format: (v) => String(v ?? 0) },
];

export default function Families() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_COLUMNS.map((col) => col.key)
  );
  const [searchExpanded, setSearchExpanded] = useState(true);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/families");
      const familiesData = response.data.families || [];
      
      // Fetch student and parent counts for each family
      const familiesWithCounts = await Promise.all(
        familiesData.map(async (family: Family) => {
          try {
            const detailResponse = await api.get(`/families/${family.id}`);
            return {
              ...family,
              studentCount: detailResponse.data.family?.students?.length || 0,
              parentCount: detailResponse.data.family?.parents?.length || 0,
            };
          } catch {
            return {
              ...family,
              studentCount: 0,
              parentCount: 0,
            };
          }
        })
      );
      
      setFamilies(familiesWithCounts);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load families");
    } finally {
      setLoading(false);
    }
  };

  const filteredFamilies = useMemo(() => {
    if (!searchQuery) return families;
    const query = searchQuery.toLowerCase();
    return families.filter(
      (family) =>
        family.familyName?.toLowerCase().includes(query) ||
        family.address?.toLowerCase().includes(query) ||
        family.city?.toLowerCase().includes(query) ||
        family.email?.toLowerCase().includes(query) ||
        family.phone?.includes(query)
    );
  }, [families, searchQuery]);

  const paginatedFamilies = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredFamilies.slice(start, start + rowsPerPage);
  }, [filteredFamilies, page, rowsPerPage]);

  const handleViewFamily = (family: Family) => {
    setSelectedFamily(family);
    setDetailDialogOpen(true);
  };

  const handleExport = () => {
    exportTableData(filteredFamilies, visibleColumns, DEFAULT_COLUMNS, "families");
  };

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  if (loading && families.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={600}>
            Families
          </Typography>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Export to Excel">
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
            </Tooltip>
            <Tooltip title="Column Visibility">
              <Button
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={(e) => setColumnMenuAnchor(e.currentTarget)}
              >
                Columns
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Search - Collapsible */}
        <Card variant="outlined">
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, pb: searchExpanded ? 1 : 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FilterListIcon color="action" />
                <Typography variant="subtitle2" fontWeight={600}>
                  Search & Filters
                </Typography>
              </Stack>
              <IconButton
                size="small"
                onClick={() => setSearchExpanded(!searchExpanded)}
              >
                {searchExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Stack>
            <Collapse in={searchExpanded}>
              <Box sx={{ px: 2, pb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search families by name, address, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Collapse>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                {visibleColumns.includes("familyName") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Family Name</TableCell>
                )}
                {visibleColumns.includes("address") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                )}
                {visibleColumns.includes("city") && (
                  <TableCell sx={{ fontWeight: "bold" }}>City</TableCell>
                )}
                {visibleColumns.includes("state") && (
                  <TableCell sx={{ fontWeight: "bold" }}>State</TableCell>
                )}
                {visibleColumns.includes("zipCode") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Zip Code</TableCell>
                )}
                {visibleColumns.includes("phone") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                )}
                {visibleColumns.includes("email") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                )}
                {visibleColumns.includes("studentCount") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Students</TableCell>
                )}
                {visibleColumns.includes("parentCount") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Parents</TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFamilies.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary">
                      {searchQuery ? "No families match your search" : "No families found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFamilies.map((family) => (
                  <TableRow key={family.id} hover>
                    {visibleColumns.includes("familyName") && (
                      <TableCell>
                        <Typography fontWeight={500}>{family.familyName}</Typography>
                      </TableCell>
                    )}
                    {visibleColumns.includes("address") && (
                      <TableCell>{family.address || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("city") && (
                      <TableCell>{family.city || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("state") && (
                      <TableCell>{family.state || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("zipCode") && (
                      <TableCell>{family.zipCode || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("phone") && (
                      <TableCell>{family.phone || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("email") && (
                      <TableCell>{family.email || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("studentCount") && (
                      <TableCell>
                        <Chip label={family.studentCount || 0} size="small" />
                      </TableCell>
                    )}
                    {visibleColumns.includes("parentCount") && (
                      <TableCell>
                        <Chip label={family.parentCount || 0} size="small" />
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewFamily(family)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={filteredFamilies.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
        />
      </Stack>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnMenuAnchor}
        open={Boolean(columnMenuAnchor)}
        onClose={() => setColumnMenuAnchor(null)}
      >
        {DEFAULT_COLUMNS.map((col) => (
          <MenuItem key={col.key} onClick={() => toggleColumn(col.key)}>
            <Checkbox checked={visibleColumns.includes(col.key)} />
            <Typography sx={{ ml: 1 }}>{col.label}</Typography>
          </MenuItem>
        ))}
      </Menu>

      {/* Family Detail Dialog */}
      {selectedFamily && (
        <FamilyDetailDialog
          open={detailDialogOpen}
          familyId={selectedFamily.id}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedFamily(null);
            loadFamilies(); // Refresh data
          }}
        />
      )}
    </Box>
  );
}
