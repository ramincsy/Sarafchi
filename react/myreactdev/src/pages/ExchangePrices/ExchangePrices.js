import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  CardHeader,
} from "@mui/material";
import ExchangePricesService from "services/ExchangePricesService";

const ExchangePrices = () => {
  const theme = useTheme();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const fetchData = async () => {
    try {
      const data = await ExchangePricesService.fetchExchangePrices();

      const validPrices = data.data.filter(
        (item) => !isNaN(parseFloat(item.usdt_sell_price))
      );

      validPrices.sort(
        (a, b) => parseFloat(a.usdt_sell_price) - parseFloat(b.usdt_sell_price)
      );

      setPrices(validPrices);

      if (validPrices.length > 0) {
        setMinPrice(validPrices[0]);
        setMaxPrice(validPrices[validPrices.length - 1]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading)
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

  if (error)
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

  return (
    <Box sx={{ padding: 4, backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        gutterBottom
        align="center"
        sx={{ color: theme.palette.primary.main, fontWeight: "bold" }}
      >
        قیمت صرافی‌های داخلی
      </Typography>

      <Grid container spacing={4} justifyContent="center" alignItems="stretch">
        {/* Minimum Price */}
        {minPrice && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                backgroundColor: theme.palette.success.light,
                color: theme.palette.success.contrastText,
              }}
            >
              <CardHeader title="کمترین قیمت" sx={{ textAlign: "center" }} />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6">{minPrice.exchange_name}</Typography>
                <Typography variant="h5">
                  {minPrice.usdt_sell_price} تومان
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Maximum Price */}
        {maxPrice && (
          <Grid item xs={12} sm={6} md={4}>
            <Card
              sx={{
                backgroundColor: theme.palette.error.light,
                color: theme.palette.error.contrastText,
              }}
            >
              <CardHeader title="بیشترین قیمت" sx={{ textAlign: "center" }} />
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6">{maxPrice.exchange_name}</Typography>
                <Typography variant="h5">
                  {maxPrice.usdt_sell_price} تومان
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={4} sx={{ marginTop: 4 }}>
        {prices.map((price, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                backgroundColor: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: 3,
              }}
            >
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6">{price.exchange_name}</Typography>
                <Typography variant="h5">
                  {price.usdt_sell_price} تومان
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ExchangePrices;
