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
  Menu,
  MenuItem,
  Checkbox,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  Alert,
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
import StaffDetailDialog from "../components/dialogs/StaffDetailDialog";

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  employeeId?: string;
  email?: string;
  phone?: string;
  employmentStatus?: string;
  positions?: Array<{ id: string; positionName: string }>;
}

const DEFAULT_COLUMNS: ExportColumn[] = [
  { key: "name", label: "Name", format: (v, row) => `${row.firstName} ${row.lastName}` },
  { key: "employeeId", label: "Employee ID" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "employmentStatus", label: "Status" },
  { key: "positions", label: "Positions", format: (v) => (v || []).map((p: any) => p.positionName).join(", ") },
];

export default function Staff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    DEFAULT_COLUMNS.map((col) => col.key)
  );

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/staff");
      setStaff(response.data.staff || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load staff");
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = useMemo(() => {
    let filtered = staff;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (member) =>
          member.firstName?.toLowerCase().includes(query) ||
          member.lastName?.toLowerCase().includes(query) ||
          member.employeeId?.toLowerCase().includes(query) ||
          member.email?.toLowerCase().includes(query) ||
          member.phone?.includes(query)
      );
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((member) => member.employmentStatus === statusFilter);
    }
    
    return filtered;
  }, [staff, searchQuery, statusFilter]);

  const paginatedStaff = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredStaff.slice(start, start + rowsPerPage);
  }, [filteredStaff, page, rowsPerPage]);

  const handleViewStaff = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setDetailDialogOpen(true);
  };

  const handleExport = () => {
    exportTableData(filteredStaff, visibleColumns, DEFAULT_COLUMNS, "staff");
  };

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  if (loading && staff.length === 0) {
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
            Staff
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

        {/* Filters - Collapsible */}
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
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search staff by name, ID, email, or phone..."
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
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
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
                {visibleColumns.includes("name") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                )}
                {visibleColumns.includes("employeeId") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Employee ID</TableCell>
                )}
                {visibleColumns.includes("email") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                )}
                {visibleColumns.includes("phone") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                )}
                {visibleColumns.includes("employmentStatus") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                )}
                {visibleColumns.includes("positions") && (
                  <TableCell sx={{ fontWeight: "bold" }}>Positions</TableCell>
                )}
                <TableCell sx={{ fontWeight: "bold" }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStaff.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={visibleColumns.length + 1}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography color="text.secondary">
                      {searchQuery || statusFilter !== "all"
                        ? "No staff match your filters"
                        : "No staff found"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStaff.map((member) => (
                  <TableRow key={member.id} hover>
                    {visibleColumns.includes("name") && (
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "primary.main",
                              fontSize: "0.875rem",
                            }}
                          >
                            {member.firstName?.[0]}
                            {member.lastName?.[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {member.firstName} {member.lastName}
                          </Typography>
                        </Stack>
                      </TableCell>
                    )}
                    {visibleColumns.includes("employeeId") && (
                      <TableCell>{member.employeeId || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("email") && (
                      <TableCell>{member.email || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("phone") && (
                      <TableCell>{member.phone || "—"}</TableCell>
                    )}
                    {visibleColumns.includes("employmentStatus") && (
                      <TableCell>
                        <Chip
                          label={member.employmentStatus || "—"}
                          size="small"
                          color={
                            member.employmentStatus === "active"
                              ? "success"
                              : member.employmentStatus === "inactive"
                              ? "warning"
                              : "error"
                          }
                        />
                      </TableCell>
                    )}
                    {visibleColumns.includes("positions") && (
                      <TableCell>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {member.positions?.slice(0, 2).map((pos) => (
                            <Chip
                              key={pos.id}
                              label={pos.positionName}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                          {member.positions && member.positions.length > 2 && (
                            <Chip
                              label={`+${member.positions.length - 2}`}
                              size="small"
                            />
                          )}
                        </Stack>
                      </TableCell>
                    )}
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewStaff(member)}
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
          count={filteredStaff.length}
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

      {/* Staff Detail Dialog */}
      {selectedStaff && (
        <StaffDetailDialog
          open={detailDialogOpen}
          staffId={selectedStaff.id}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedStaff(null);
            loadStaff(); // Refresh data
          }}
        />
      )}
    </Box>
  );
}
