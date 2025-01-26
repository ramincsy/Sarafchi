import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TablePagination,
} from "@mui/material";
import WithdrawalsUSDTService from "services/WithdrawalsUSDTService";
import AuthContext from "contexts/AuthContext"; // AuthContext را import کنید
import { getUserID } from "utils/userUtils";
const WithdrawUSDTPage = () => {
  const [amount, setAmount] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { userInfo } = useContext(AuthContext);
  const user_id = getUserID(userInfo); // استخراج فقط UserID
  console.log("User ID:", user_id);

  const fetchWithdrawals = async () => {
    try {
      const data = await WithdrawalsUSDTService.fetchAllWithdrawals();
      if (data.success) {
        setWithdrawHistory(data.data);
        setError(null);
      } else {
        setError(data.error || "خطا در دریافت تاریخچه برداشت.");
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setError("خطا در دریافت تاریخچه برداشت.");
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleWithdraw = async () => {
    if (!amount || !destinationAddress) {
      setError("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    const payload = {
      UserID: user_id,
      Amount: parseFloat(amount),
      DestinationAddress: destinationAddress,
    };

    try {
      const response = await WithdrawalsUSDTService.createWithdrawal(payload);
      if (response.success) {
        setSuccess("درخواست برداشت با موفقیت ثبت شد.");
        setError(null);
        setAmount("");
        setDestinationAddress("");
        fetchWithdrawals();
      } else {
        setError(response.error || "خطا در ثبت درخواست برداشت.");
        setSuccess(null);
      }
    } catch (err) {
      console.error("Error during withdrawal request:", err);
      setError("خطا در ثبت درخواست برداشت.");
      setSuccess(null);
    }
  };

  const handleApprove = async (withdrawalId) => {
    try {
      const response = await WithdrawalsUSDTService.approveWithdrawal({
        WithdrawalID: withdrawalId,
        StatusChangedBy: user_id,
        TransactionTxID: `TXID-${withdrawalId}`,
      });
      if (response.success) {
        setSuccess("تراکنش با موفقیت تایید شد.");
        fetchWithdrawals();
      } else {
        setError(response.error || "خطا در تایید تراکنش.");
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      setError("خطا در تایید تراکنش.");
    }
  };

  const handleReject = async (withdrawalId) => {
    try {
      const response = await WithdrawalsUSDTService.rejectWithdrawal({
        WithdrawalID: withdrawalId,
        StatusChangedBy: user_id,
      });
      if (response.success) {
        setSuccess("تراکنش با موفقیت لغو شد.");
        fetchWithdrawals();
      } else {
        setError(response.error || "خطا در لغو تراکنش.");
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      setError("خطا در لغو تراکنش.");
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" textAlign="center" mb={4}>
        درخواست برداشت USDT
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="فرم درخواست برداشت"
              sx={{ textAlign: "center", fontWeight: "bold" }}
            />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="آدرس مقصد"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  fullWidth
                />
                <TextField
                  label="مقدار USDT"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type="number"
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleWithdraw}
                  fullWidth
                >
                  ثبت درخواست
                </Button>
                {error && (
                  <Typography color="error" textAlign="center">
                    {error}
                  </Typography>
                )}
                {success && (
                  <Typography sx={{ color: "green", textAlign: "center" }}>
                    {success}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="تاریخچه برداشت‌ها"
              sx={{ textAlign: "center", fontWeight: "bold" }}
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">شناسه</TableCell>
                      <TableCell align="center">مقدار</TableCell>
                      <TableCell align="center">آدرس مقصد</TableCell>
                      <TableCell align="center">وضعیت</TableCell>
                      <TableCell align="center">عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {withdrawHistory
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((row) => (
                        <TableRow key={row.WithdrawalID}>
                          <TableCell align="center">
                            {row.WithdrawalID}
                          </TableCell>
                          <TableCell align="center">{row.Amount}</TableCell>
                          <TableCell align="center">
                            {row.DestinationAddress}
                          </TableCell>
                          <TableCell align="center">{row.Status}</TableCell>
                          <TableCell align="center">
                            {row.Status === "Pending" && (
                              <>
                                <Button
                                  variant="contained"
                                  color="success"
                                  onClick={() =>
                                    handleApprove(row.WithdrawalID)
                                  }
                                  sx={{ marginRight: 1 }}
                                >
                                  تایید
                                </Button>
                                <Button
                                  variant="contained"
                                  color="error"
                                  onClick={() => handleReject(row.WithdrawalID)}
                                >
                                  لغو
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={withdrawHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WithdrawUSDTPage;
