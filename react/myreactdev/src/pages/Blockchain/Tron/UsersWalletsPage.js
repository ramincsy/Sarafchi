import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import axiosInstance from "utils/axiosInstance";

const UsersWalletsPage = () => {
  const [usersWallets, setUsersWallets] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingBalances, setUpdatingBalances] = useState(false); // برای وضعیت دکمه به‌روزرسانی

  useEffect(() => {
    fetchUsersWallets();
  }, []);

  const fetchUsersWallets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/users-wallets");
      const wallets =
        response.data?.users_wallets.map((user) => ({
          ...user,
          Balance: typeof user.Balance === "number" ? user.Balance : 0,
        })) || [];
      const balance = response.data?.total_balance || 0;

      setUsersWallets(wallets);
      setTotalBalance(balance);
    } catch (error) {
      console.error("Error fetching users wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBalances = async () => {
    try {
      setUpdatingBalances(true);
      const response = await axiosInstance.post("/update-balances");
      console.log("Balances updated:", response.data);
      fetchUsersWallets(); // به‌روزرسانی داده‌های جدول پس از موفقیت
      alert("Balances updated successfully.");
    } catch (error) {
      console.error("Error updating balances:", error);
      alert("Failed to update balances. Please try again.");
    } finally {
      setUpdatingBalances(false);
    }
  };

  const filteredUsers = usersWallets.filter((user) =>
    `${user.FirstName} ${user.LastName} ${user.Email}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Users and Wallets
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 2,
        }}
      >
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          fullWidth
        />
        <Button
          variant="contained"
          color="primary"
          onClick={updateBalances}
          disabled={updatingBalances} // غیرفعال کردن دکمه در حین به‌روزرسانی
          sx={{ marginLeft: 2 }}
        >
          {updatingBalances ? "Updating..." : "Update Balances"}
        </Button>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "200px",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>User ID</TableCell>
                <TableCell>First Name</TableCell>
                <TableCell>Last Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Wallet Address</TableCell>
                <TableCell>Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.UserID}>
                    <TableCell>{user.UserID}</TableCell>
                    <TableCell>{user.FirstName}</TableCell>
                    <TableCell>{user.LastName}</TableCell>
                    <TableCell>{user.Email}</TableCell>
                    <TableCell>{user.WalletAddress}</TableCell>
                    <TableCell>
                      {user.Balance ? user.Balance.toFixed(8) : "0.00000000"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No results found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Typography variant="h6" sx={{ marginTop: 2 }}>
        Total Balance: {totalBalance.toFixed(8)} USDT
      </Typography>
    </Box>
  );
};

export default UsersWalletsPage;
