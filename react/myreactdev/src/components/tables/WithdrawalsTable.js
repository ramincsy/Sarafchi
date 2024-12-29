import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import WithdrawalsService from "services/WithdrawalsService";

function WithdrawalsRow({ row, onApprove, onReject, visibleColumns }) {
  const [open, setOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "orange";
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "black";
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        {visibleColumns.includes("user") && <TableCell>{row.user}</TableCell>}
        {visibleColumns.includes("amount") && (
          <TableCell>{row.amount}</TableCell>
        )}
        {visibleColumns.includes("currency") && (
          <TableCell>{row.currency}</TableCell>
        )}
        {visibleColumns.includes("iban") && <TableCell>{row.iban}</TableCell>}
        {visibleColumns.includes("accountHolder") && (
          <TableCell>{row.accountHolder}</TableCell>
        )}
        {visibleColumns.includes("date") && <TableCell>{row.date}</TableCell>}
        {visibleColumns.includes("status") && (
          <TableCell>
            <Typography
              sx={{
                color: getStatusColor(row.status),
                fontWeight: "bold",
              }}
            >
              {row.status}
            </Typography>
          </TableCell>
        )}
        {visibleColumns.includes("actions") && (
          <TableCell>
            {row.status === "Pending" && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => onApprove(row.id)}
                  sx={{ mr: 1 }}
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
              </>
            )}
          </TableCell>
        )}
      </TableRow>
      <TableRow>
        <TableCell
          style={{ paddingBottom: 0, paddingTop: 0 }}
          colSpan={visibleColumns.length + 1}
        >
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
                padding: 2,
                backgroundColor: "#f4f6f8",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Details
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 2,
                }}
              >
                {Object.entries(row.details).map(([key, value]) => (
                  <Box key={key}>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {key}:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {value || "-"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

WithdrawalsRow.propTypes = {
  row: PropTypes.object.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
  visibleColumns: PropTypes.array.isRequired,
};

export default function WithdrawalsTable({
  title,
  showApproveButton,
  showRejectButton,
  visibleColumns,
}) {
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const data = await WithdrawalsService.fetchWithdrawals();
        if (data.success) {
          setWithdrawals(
            data.data.map((w) => ({
              id: w.WithdrawalID,
              user: w.UserID,
              amount: w.Amount,
              currency: w.CurrencyType,
              iban: w.IBAN,
              accountHolder: w.AccountHolderName,
              date: new Date(w.WithdrawalDateTime).toLocaleString(),
              status: w.Status,
              details: w, // Full object for expandable rows
            }))
          );
        } else {
          setError("Error fetching withdrawals");
        }
      } catch (err) {
        console.error("Error fetching withdrawals:", err);
        setError("Network or server error");
      }
    };

    fetchWithdrawals();
  }, []);

  const handleApprove = async (id) => {
    try {
      const data = await WithdrawalsService.updateWithdrawalStatus(
        id,
        "Approved"
      );
      if (data.success) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "Approved" } : w))
        );
        alert("Withdrawal approved");
      } else {
        alert(data.message || "Error approving withdrawal");
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      alert("Error approving withdrawal");
    }
  };

  const handleReject = async (id) => {
    try {
      const data = await WithdrawalsService.updateWithdrawalStatus(
        id,
        "Rejected"
      );
      if (data.success) {
        setWithdrawals((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "Rejected" } : w))
        );
        alert("Withdrawal rejected");
      } else {
        alert(data.message || "Error rejecting withdrawal");
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      alert("Error rejecting withdrawal");
    }
  };

  return (
    <Paper sx={{ width: "100%", overflowX: "auto", p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell />
              {visibleColumns.includes("user") && <TableCell>User</TableCell>}
              {visibleColumns.includes("amount") && (
                <TableCell>Amount</TableCell>
              )}
              {visibleColumns.includes("currency") && (
                <TableCell>Currency</TableCell>
              )}
              {visibleColumns.includes("iban") && <TableCell>IBAN</TableCell>}
              {visibleColumns.includes("accountHolder") && (
                <TableCell>Account Holder</TableCell>
              )}
              {visibleColumns.includes("date") && <TableCell>Date</TableCell>}
              {visibleColumns.includes("status") && (
                <TableCell>Status</TableCell>
              )}
              {visibleColumns.includes("actions") && (
                <TableCell>Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {withdrawals.map((row) => (
              <WithdrawalsRow
                key={row.id}
                row={row}
                onApprove={showApproveButton ? handleApprove : null}
                onReject={showRejectButton ? handleReject : null}
                visibleColumns={visibleColumns}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

WithdrawalsTable.propTypes = {
  title: PropTypes.string,
  showApproveButton: PropTypes.bool,
  showRejectButton: PropTypes.bool,
  visibleColumns: PropTypes.array.isRequired,
};

WithdrawalsTable.defaultProps = {
  title: "",
  showApproveButton: true,
  showRejectButton: true,
  visibleColumns: [
    "user",
    "amount",
    "currency",
    "iban",
    "accountHolder",
    "date",
    "status",
    "actions",
  ],
};
