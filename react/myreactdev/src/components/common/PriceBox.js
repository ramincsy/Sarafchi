import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";
import ApiManager from "services/ApiManager";

const PriceBox = ({
  refreshInterval = 100000, // مقدار پیش‌فرض
  showBuyPrice = true, // مقدار پیش‌فرض
  showSellPrice = true, // مقدار پیش‌فرض
  splitBoxes = true, // مقدار پیش‌فرض
}) => {
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [livePrice, setLivePrice] = useState(null);
  const [buyPrice, setBuyPrice] = useState(null);

  // واکشی قیمت‌ها
  const fetchPrice = async () => {
    setLoadingPrice(true);
    try {
      const data = await ApiManager.PriceService.fetchPrice();
      if (data.success) {
        const sellPrice = data.price;
        const calculatedBuyPrice = sellPrice - 950;
        setLivePrice(sellPrice); // قیمت فروش
        setBuyPrice(calculatedBuyPrice); // قیمت خرید
        setPriceError(null);
      } else {
        setPriceError("خطا در دریافت قیمت");
      }
    } catch (error) {
      setPriceError("خطای شبکه یا سرور");
    } finally {
      setLoadingPrice(false);
    }
  };

  useEffect(() => {
    fetchPrice(); // اولین بار واکشی
    const interval = setInterval(fetchPrice, refreshInterval); // تنظیم زمان‌بندی
    return () => clearInterval(interval); // پاکسازی تایمر
  }, [refreshInterval]);

  if (loadingPrice) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        padding={2}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (priceError) {
    return (
      <Card
        sx={{
          padding: 2,
          margin: 1,
          textAlign: "center",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
          borderRadius: "12px",
          backgroundColor: "#ffe5e5",
        }}
      >
        <Typography color="error" variant="h6">
          {priceError}
        </Typography>
      </Card>
    );
  }

  return (
    <Box display={splitBoxes ? "flex" : "block"} gap={2}>
      {showSellPrice && (
        <Card
          sx={{
            flex: 1,
            padding: 2,
            borderRadius: "12px",
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#e3f2fd",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#000000", fontWeight: "bold" }}
            >
              قیمت فروش
            </Typography>
            <Typography variant="h4" color="red" sx={{ fontWeight: "bold" }}>
              {livePrice?.toLocaleString()} تومان
            </Typography>
          </CardContent>
        </Card>
      )}

      {showBuyPrice && (
        <Card
          sx={{
            flex: 1,
            padding: 2,
            borderRadius: "12px",
            boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.3)",
            backgroundColor: "#e8f5e9",
            transition: "all 0.3s ease-in-out",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: "#000000", fontWeight: "bold" }}
            >
              قیمت خرید
            </Typography>
            <Typography variant="h4" color="green" sx={{ fontWeight: "bold" }}>
              {buyPrice?.toLocaleString()} تومان
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

PriceBox.propTypes = {
  /** زمان تازه‌سازی قیمت‌ها (به میلی‌ثانیه) */
  refreshInterval: PropTypes.number,
  /** نمایش قیمت خرید */
  showBuyPrice: PropTypes.bool,
  /** نمایش قیمت فروش */
  showSellPrice: PropTypes.bool,
  /** نمایش جداگانه قیمت‌ها در باکس‌های جدا */
  splitBoxes: PropTypes.bool,
};

export default PriceBox;
