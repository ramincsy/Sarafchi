import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  MonetizationOn as MoneyIcon,
  Lock as LockIcon,
  TrendingDown as DebtIcon,
  TrendingUp as CreditIcon,
  LocalAtm as LoanIcon,
  Replay as LoanRepayIcon,
} from "@mui/icons-material";
import BalancesService from "services/BalancesService";
import AuthContext from "contexts/AuthContext";

const BalancesPage = () => {
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userInfo } = useContext(AuthContext);
  const userId = userInfo?.UserID;

  useEffect(() => {
    if (userId) {
      fetchBalances(userId);
    } else {
      setError("User ID not found. Please log in.");
      setLoading(false);
    }
  }, [userId]);

  const fetchBalances = async (user_id) => {
    try {
      setLoading(true);
      const data = await BalancesService.fetchBalances(user_id);
      if (!data || !data.balances) {
        throw new Error("Invalid response from API.");
      }

      const structuredBalances = data.balances.map((b) => ({
        CurrencyType: b.CurrencyType || "N/A",
        Balance: b.Balance || 0,
        WithdrawableBalance: b.WithdrawableBalance || 0,
        Debt: b.Debt || 0,
        Credit: b.Credit || 0,
        LoanAmount: b.LoanAmount || 0,
        LoanRepayment: b.LoanRepayment || 0,
        LockedBalance: b.LockedBalance || 0,
      }));

      setBalances(structuredBalances);
      setError(null);
    } catch (err) {
      setError(err.message || "خطا در دریافت اطلاعات مالی");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // **انتخاب آیکون مناسب برای هر نوع مقدار**
  const balanceItems = [
    { key: "Balance", label: "موجودی", icon: <WalletIcon />, color: "#00796B" },
    {
      key: "WithdrawableBalance",
      label: "موجودی قابل برداشت",
      icon: <MoneyIcon />,
      color: "#388E3C",
    },
    { key: "Debt", label: "بدهی", icon: <DebtIcon />, color: "#D32F2F" },
    {
      key: "Credit",
      label: "بستانکاری",
      icon: <CreditIcon />,
      color: "#FFA000",
    },
    { key: "LoanAmount", label: "وام", icon: <LoanIcon />, color: "#512DA8" },
    {
      key: "LoanRepayment",
      label: "بازپرداخت وام",
      icon: <LoanRepayIcon />,
      color: "#1976D2",
    },
    {
      key: "LockedBalance",
      label: "موجودی قفل شده",
      icon: <LockIcon />,
      color: "#455A64",
    },
  ];

  return (
    <Box sx={{ padding: 3 }}>
      <Grid container spacing={4} justifyContent="center">
        {balances.map((balance, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                backgroundColor: "#f5f5f5",
                color: "#333",
                borderRadius: 3,
                boxShadow: 3,
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.05)", boxShadow: 6 },
                textAlign: "center",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{ fontWeight: "bold", color: "#0288D1" }}
                >
                  {balance.CurrencyType}
                </Typography>
                {balanceItems.map((item) => (
                  <Box
                    key={item.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 16px",
                      backgroundColor: item.color,
                      color: "#fff",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      boxShadow: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {item.icon}
                      <Typography
                        variant="body1"
                        sx={{ marginLeft: "8px", fontWeight: "bold" }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {balance[item.key]?.toLocaleString()}{" "}
                      {balance.CurrencyType}
                    </Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BalancesPage;
