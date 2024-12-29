import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
} from "@mui/material";
import BalancesService from "services/BalancesService";

const BalancesPage = () => {
  const theme = useTheme();
  const [balances, setBalances] = useState([]);
  const [summary, setSummary] = useState({
    debtCredit: null,
    locked: null,
    withdrawable: null,
    loanRemaining: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserID = () => {
    try {
      const storedUserInfo = localStorage.getItem("user_info");
      if (storedUserInfo) {
        const { user_id } = JSON.parse(storedUserInfo);
        return user_id;
      }
    } catch (err) {
      console.error("Error reading user_id from localStorage:", err);
    }
    return null;
  };

  const fetchBalances = async () => {
    const user_id = getUserID();

    if (!user_id) {
      setError("User ID not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await BalancesService.fetchBalances(user_id);
      if (data.success) {
        const defaultCurrencies = ["IRR", "USD", "USDT"];
        const apiBalances = data.balances.filter((b) => b.NetBalance > 0);

        const defaultBalances = defaultCurrencies.map((currency) => {
          const match = apiBalances.find((b) => b.CurrencyType === currency);
          return match || { CurrencyType: currency, NetBalance: 0 };
        });

        const additionalBalances = apiBalances.filter(
          (b) => !defaultCurrencies.includes(b.CurrencyType)
        );

        setBalances([...defaultBalances, ...additionalBalances]);
        setSummary({
          debtCredit: data.summary.total_net_balance || null,
          locked: data.summary.total_locked_balance || null,
          withdrawable: data.summary.total_withdrawable_balance || null,
          loanRemaining:
            apiBalances.reduce((acc, b) => acc + (b.LoanBalance || 0), 0) ||
            null,
        });
      } else {
        throw new Error(data.error || "Failed to fetch balances");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

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
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const getCardStyles = (title) => {
    const lightColors = {
      "موجودی IRR": "#f0ad4e",
      "موجودی USD": "#5bc0de",
      "موجودی USDT": "#5cb85c",
      "بدهکار / بستانکار": "#d9534f",
      "موجودی قفل شده": "#337ab7",
      "موجودی قابل برداشت": "#5e5e5e",
      "مانده وام": "#a47ae2",
    };

    const darkColors = {
      "موجودی IRR": "#a66f2d",
      "موجودی USD": "#31708f",
      "موجودی USDT": "#3d8b3d",
      "بدهکار / بستانکار": "#a94442",
      "موجودی قفل شده": "#204d74",
      "موجودی قابل برداشت": "#404040",
      "مانده وام": "#7159a0",
    };

    return {
      backgroundColor:
        theme.palette.mode === "light"
          ? lightColors[title] || theme.palette.primary.light
          : darkColors[title] || theme.palette.primary.dark,
      color: theme.palette.getContrastText(
        theme.palette.mode === "light"
          ? lightColors[title] || theme.palette.primary.light
          : darkColors[title] || theme.palette.primary.dark
      ),
      borderRadius: 3,
      boxShadow: 3,
      transition: "transform 0.3s",
      "&:hover": {
        transform: "scale(1.05)",
        boxShadow: 6,
      },
    };
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}
      >
        وضعیت مالی
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {balances.map((balance, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={getCardStyles(`موجودی ${balance.CurrencyType}`)}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  موجودی {balance.CurrencyType}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {balance.NetBalance.toLocaleString()} {balance.CurrencyType}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {[
          { title: "بدهکار / بستانکار", value: summary.debtCredit },
          { title: "موجودی قفل شده", value: summary.locked },
          { title: "موجودی قابل برداشت", value: summary.withdrawable },
          { title: "مانده وام", value: summary.loanRemaining },
        ].map((item, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={getCardStyles(item.title)}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {item.value?.toLocaleString() || "null"} تومان
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BalancesPage;
