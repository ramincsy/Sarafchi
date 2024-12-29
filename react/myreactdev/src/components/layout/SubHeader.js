import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, useTheme } from "@mui/material"; // اضافه کردن useTheme

const SubHeader = () => {
  const theme = useTheme(); // دسترسی به تم
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

  const currentUserID = getUserID();
  const [balances, setBalances] = useState({
    USD: 0,
    EUR: 0,
    IRR: 0,
  });

  useEffect(() => {
    if (currentUserID) {
      fetch(`http://localhost:5000/api/balances/${currentUserID}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.success && Array.isArray(data.balances)) {
            const apiBalances = data.balances;
            setBalances({
              USD: getNetBalance(apiBalances, "USD"),
              EUR: getNetBalance(apiBalances, "EUR"),
              IRR: getNetBalance(apiBalances, "IRR"),
            });
          } else {
            console.error("Unexpected API response structure:", data);
          }
        })
        .catch((error) => console.error("Error fetching balances:", error));
    }
  }, [currentUserID]);

  const getNetBalance = (balancesArray, currencyType) => {
    const balance = balancesArray.find(
      (item) => item.CurrencyType === currencyType
    );
    return balance ? balance.NetBalance : 0;
  };

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper, // استفاده از رنگ تم
        borderBottom: `1px solid ${theme.palette.divider}`, // استفاده از رنگ تم
        padding: "8px 16px",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        top: "-4px",
        zIndex: "1",
      }}
    >
      <Grid container spacing={2} maxWidth="lg">
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary, // استفاده از رنگ متن تم
            }}
          >
            <strong>موجودی دلار:</strong> {balances.USD.toLocaleString()} USD
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary, // استفاده از رنگ متن تم
            }}
          >
            <strong>موجودی یورو:</strong> {balances.EUR.toLocaleString()} EUR
          </Typography>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary, // استفاده از رنگ متن تم
            }}
          >
            <strong>موجودی ریال:</strong> {balances.IRR.toLocaleString()} IRR
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SubHeader;
