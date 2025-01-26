// FinancialDashboard.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import FinancialDashboardService from "services/FinancialDashboardService";

const FinancialDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    fetchData();
    fetchLogs();
    fetchTransactions();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await FinancialDashboardService.fetchOverview();
      setData(response);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await FinancialDashboardService.fetchBalanceLogs();
      setLogs(response);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    setTransactionsLoading(true);
    try {
      const response = await FinancialDashboardService.fetchTransactions();
      setTransactions(response);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const formatCurrency = (value, currency) => {
    try {
      // اگر ارز فیات باشد (مطابق با ISO 4217)
      if (currency && typeof currency === "string" && currency.length === 3) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currency,
        }).format(value);
      } else {
        // اگر ارز دیجیتال باشد (مانند USDT)
        return `${value.toLocaleString("en-US")} ${currency || ""}`;
      }
    } catch (error) {
      console.error("Error formatting currency:", error);
      return `${value} ${currency || ""}`;
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        داشبورد نظارت مالی
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {/* بخش موجودی کاربران */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">موجودی کاربران</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ارز</TableCell>
                      <TableCell align="right">موجودی کل</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.userBalances.map((row) => (
                      <TableRow key={row.currencyType}>
                        <TableCell>{row.currencyType}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.totalBalance, row.currencyType)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* بخش موجودی کیف پول صرافی */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">موجودی کیف پول‌های صرافی</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ارز</TableCell>
                      <TableCell align="right">موجودی کل</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.exchangeBalances.map((row) => (
                      <TableRow key={row.currencyType}>
                        <TableCell>{row.currencyType}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.totalBalance, row.currencyType)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* بخش اختلافات */}
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">اختلاف موجودی‌ها</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>ارز</TableCell>
                      <TableCell align="right">موجودی کاربر</TableCell>
                      <TableCell align="right">موجودی صرافی</TableCell>
                      <TableCell align="right">اختلاف</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data?.discrepancies.map((row) => (
                      <TableRow key={row.currencyType}>
                        <TableCell>{row.currencyType}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.userBalance, row.currencyType)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            row.exchangeBalance,
                            row.currencyType
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(row.difference, row.currencyType)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                color="primary"
                onClick={fetchData}
                style={{ marginTop: "20px" }}
              >
                بروزرسانی داده‌ها
              </Button>
            </Paper>
          </Grid>

          {/* بخش لاگ‌ها */}
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">لاگ تغییرات موجودی</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>شناسه لاگ</TableCell>
                      <TableCell>شناسه کاربر</TableCell>
                      <TableCell>نوع عملیات</TableCell>
                      <TableCell>موجودی قدیمی</TableCell>
                      <TableCell>موجودی جدید</TableCell>
                      <TableCell>تاریخ عملیات</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      logs.map((log) => (
                        <TableRow key={log.LogID}>
                          <TableCell>{log.LogID}</TableCell>
                          <TableCell>{log.UserID}</TableCell>
                          <TableCell>{log.ActionType}</TableCell>
                          <TableCell>{log.OldDebit}</TableCell>
                          <TableCell>{log.NewDebit}</TableCell>
                          <TableCell>{log.ActionDateTime}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* بخش تراکنش‌ها */}
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: "20px" }}>
              <Typography variant="h6">تراکنش‌های اخیر</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>شناسه تراکنش</TableCell>
                      <TableCell>شناسه کاربر</TableCell>
                      <TableCell>تعداد</TableCell>
                      <TableCell>قیمت</TableCell>
                      <TableCell>نوع</TableCell>
                      <TableCell>تاریخ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactionsLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <CircularProgress />
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((transaction) => (
                        <TableRow key={transaction.TransactionID}>
                          <TableCell>{transaction.TransactionID}</TableCell>
                          <TableCell>{transaction.UserID}</TableCell>
                          <TableCell>{transaction.Quantity}</TableCell>
                          <TableCell>{transaction.Price}</TableCell>
                          <TableCell>{transaction.TransactionType}</TableCell>
                          <TableCell>
                            {transaction.TransactionDateTime}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default FinancialDashboard;
