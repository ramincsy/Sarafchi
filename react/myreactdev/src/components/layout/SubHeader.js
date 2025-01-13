import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Grid,
  useTheme,
  CircularProgress,
} from "@mui/material";
import ApiManager from "services/ApiManager"; // وارد کردن ApiManager
import AuthContext from "contexts/AuthContext";

const SubHeader = () => {
  const theme = useTheme();
  const [balances, setBalances] = useState({
    USD: 0,
    EUR: 0,
    IRR: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // دریافت userInfo از AuthContext
  const { userInfo } = useContext(AuthContext);
  const userID = userInfo?.UserID;

  useEffect(() => {
    if (userID) {
      fetchBalances(userID);
    } else {
      setError("شناسه کاربر یافت نشد.");
      setIsLoading(false);
    }
  }, [userID]);

  const fetchBalances = async (userId) => {
    try {
      setIsLoading(true);
      const data = await ApiManager.BalancesService.fetchBalances(userId);
      if (data.success && Array.isArray(data.balances)) {
        const apiBalances = data.balances;
        setBalances({
          USD: getNetBalance(apiBalances, "USD"),
          EUR: getNetBalance(apiBalances, "EUR"),
          IRR: getNetBalance(apiBalances, "IRR"),
        });
      } else {
        console.error("Unexpected API response structure:", data);
        setError("خطا در دریافت اطلاعات بالانس.");
      }
    } catch (err) {
      console.error("Error fetching balances:", err);
      setError("خطایی در ارتباط با سرور رخ داده است.");
    } finally {
      setIsLoading(false);
    }
  };

  const getNetBalance = (balancesArray, currencyType) => {
    const balance = balancesArray.find(
      (item) => item.CurrencyType === currencyType
    );
    return balance ? balance.NetBalance : 0;
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
        padding: "8px 16px",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        top: "-4px",
        zIndex: "1",
      }}
    >
      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error" variant="subtitle1" align="center">
          {error}
        </Typography>
      ) : (
        <Grid container spacing={2} maxWidth="lg">
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ fontWeight: 500, color: theme.palette.text.primary }}
            >
              <strong>موجودی دلار:</strong>{" "}
              {balances.USD.toLocaleString("fa-IR")} USD
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ fontWeight: 500, color: theme.palette.text.primary }}
            >
              <strong>موجودی یورو:</strong>{" "}
              {balances.EUR.toLocaleString("fa-IR")} EUR
            </Typography>
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ fontWeight: 500, color: theme.palette.text.primary }}
            >
              <strong>موجودی ریال:</strong>{" "}
              {balances.IRR.toLocaleString("fa-IR")} IRR
            </Typography>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default SubHeader;
