import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Button,
  Typography,
  IconButton,
  Collapse,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  CloudDownload as CloudDownloadIcon,
} from "@mui/icons-material";
import * as XLSX from "xlsx";
import ApiManager from "services/ApiManager";

const TransactionRow = ({ row, onApprove, onReject, visibleColumns }) => {
  const [open, setOpen] = useState(false);

  const statusColors = {
    Processing: "primary.main",
    Canceled: "error.main",
    Completed: "success.main",
    Rejected: "error.main",
    Approved: "success.main",
  };

  return (
    <>
      <TableRow hover>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {visibleColumns.map((column) => (
          <TableCell key={column}>
            {column === "status" ? (
              <Typography
                color={statusColors[row.status] || "text.primary"}
                fontWeight="bold"
              >
                {row.status}
              </Typography>
            ) : column === "actions" && row.status === "Processing" ? (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => onApprove(row.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => onReject(row.id)}
                >
                  Reject
                </Button>
              </Stack>
            ) : (
              row[column]
            )}
          </TableCell>
        ))}
      </TableRow>
      <TableRow>
        <TableCell colSpan={visibleColumns.length + 1} sx={{ py: 0 }}>
          <Collapse in={open}>
            <Box sx={{ p: 3, bgcolor: "grey.50" }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Details
              </Typography>
              <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                gap={2}
              >
                {Object.entries(row.details).map(([key, value]) => (
                  <Paper key={key} sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {key}:
                    </Typography>
                    <Typography variant="body2">{value || "-"}</Typography>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const TransactionTable = ({
  role,
  showApproveButton = true,
  showRejectButton = true,
  visibleColumns = [
    "user",
    "type",
    "currency",
    "quantity",
    "price",
    "total",
    "date",
    "status",
    "actions",
  ],
}) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    const filtered = transactions.filter((tx) => {
      const matchesSearch = Object.values(tx)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    setFilteredData(filtered);
    setPage(0);
  }, [searchTerm, statusFilter, transactions]);

  const fetchTransactions = async () => {
    try {
      const data = await ApiManager.TransactionsService.fetchTransactions();
      if (Array.isArray(data)) {
        const formattedData = data.map((tx) => ({
          id: tx.TransactionID,
          user: tx.UserID,
          type: tx.TransactionType,
          currency: tx.CurrencyType,
          quantity: tx.Quantity,
          price: tx.Price,
          total: tx.Quantity * tx.Price,
          date: new Date(tx.TransactionDateTime).toLocaleString(),
          status: tx.Status,
          details: tx,
        }));
        setTransactions(formattedData);
        setFilteredData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transactions");
    }
  };

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((row) =>
        visibleColumns.reduce((acc, col) => ({ ...acc, [col]: row[col] }), {})
      )
    );
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");
    XLSX.writeFile(workbook, "transactions.xlsx");
  };

  const handleStatusUpdate = async (id, action) => {
    try {
      const { success, message } =
        await ApiManager.TransactionsService.updateTransactionStatus(
          id,
          action
        );
      if (success) {
        const newStatus = action === "confirm" ? "Approved" : "Rejected";
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === id ? { ...tx, status: newStatus } : tx))
        );
      } else {
        throw new Error(message);
      }
    } catch (err) {
      console.error(`Error ${action}ing transaction:`, err);
      setError(`Failed to ${action} transaction`);
    }
  };

  return (
    <Paper sx={{ width: "100%", p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
              <MenuItem value="Canceled">Canceled</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            startIcon={<CloudDownloadIcon />}
            onClick={handleDownload}
          >
            Download Excel
          </Button>
        </Stack>

        {error && <Typography color="error">{error}</Typography>}

        <TableContainer
          sx={{
            height: "100%",
            maxHeight: "calc(100vh - 250px)", // برای فضای هدر و فیلترها
            overflowY: "auto",
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" />
                {visibleColumns.map((column) => (
                  <TableCell key={column}>
                    {column.charAt(0).toUpperCase() + column.slice(1)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TransactionRow
                    key={row.id}
                    row={row}
                    onApprove={
                      showApproveButton
                        ? (id) => handleStatusUpdate(id, "confirm")
                        : null
                    }
                    onReject={
                      showRejectButton
                        ? (id) => handleStatusUpdate(id, "cancel")
                        : null
                    }
                    visibleColumns={visibleColumns}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Stack>
    </Paper>
  );
};

TransactionRow.propTypes = {
  row: PropTypes.object.isRequired,
  onApprove: PropTypes.func,
  onReject: PropTypes.func,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
};

TransactionTable.propTypes = {
  title: PropTypes.string,
  role: PropTypes.oneOf(["manager", "employee", "customer"]).isRequired,
  showApproveButton: PropTypes.bool,
  showRejectButton: PropTypes.bool,
  visibleColumns: PropTypes.arrayOf(PropTypes.string),
};

export default TransactionTable;
