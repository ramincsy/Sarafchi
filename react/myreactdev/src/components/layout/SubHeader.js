import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Paper,
} from "@mui/material";
import AuthContext from "contexts/AuthContext";
import ApiManager from "services/ApiManager";
import useUSDTPrice from "hooks/useUSDTPrice";
import { Sparklines, SparklinesLine } from "react-sparklines";

const SubHeader = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userInfo } = useContext(AuthContext);
  const userID = userInfo?.UserID;

  const {
    price: usdPrice,
    loading: priceLoading,
    error: priceError,
  } = useUSDTPrice("sell");
  const [balances, setBalances] = useState({ USDT: 0, Toman: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userID) {
      fetchBalances(userID);
    } else {
      setError("شناسه کاربر یافت نشد.");
      setIsLoading(false);
    }
  }, [userID]);

  const fetchBalances = async (uid) => {
    try {
      setIsLoading(true);
      const data = await ApiManager.BalancesService.fetchBalances(uid);
      console.log("Fetched Balances Data:", data); // اضافه کردن این خط برای دیباگ
      if (data.success && Array.isArray(data.balances)) {
        setBalances({
          USDT:
            data.balances.find((item) => item.CurrencyType === "USDT")
              ?.WithdrawableBalance || 0, // استفاده از WithdrawableBalance
          Toman:
            data.balances.find((item) => item.CurrencyType === "Toman")
              ?.WithdrawableBalance || 0, // استفاده از WithdrawableBalance
        });
      } else {
        setError("خطا در دریافت موجودی‌ها.");
      }
    } catch (err) {
      console.error("خطا در دریافت موجودی‌ها:", err);
      setError("ارتباط با سرور با مشکل مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (value) => value.toLocaleString("fa-IR");

  // تابع رندر کارت با نمودار به عنوان پس‌زمینه
  const renderCard = (card) => (
    <Card
      sx={{
        width: isMobile ? 120 : 200,
        height: isMobile ? 50 : 70,
        position: "relative",
        borderRadius: 12,
        background: card.bgGradient,
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        overflow: "hidden",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0px 6px 16px rgba(0,0,0,0.2)",
        },
      }}
    >
      {/* نمودار به عنوان پس‌زمینه */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          opacity: 0.2,
          zIndex: 1,
        }}
      >
        <Sparklines data={card.sparkData}>
          <SparklinesLine
            style={{
              stroke: card.chartColor,
              fill: "none",
              strokeWidth: 4,
              strokeLinecap: "round",
            }}
          />
        </Sparklines>
      </Box>
      {/* محتوای متنی */}
      <CardContent
        sx={{
          position: "relative",
          zIndex: 2,
          p: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontSize: isMobile ? "0.75rem" : card.titleFontSize,
            color: card.titleColor,
            fontWeight: 600,
          }}
        >
          {card.title}
        </Typography>
        <Typography
          variant="h5"
          sx={{
            fontSize: isMobile ? "0.9rem" : card.valueFontSize,
            color: card.valueColor,
            fontWeight: "bold",
          }}
        >
          {formatNumber(card.value)} {card.suffix}
        </Typography>
      </CardContent>
    </Card>
  );

  // تنظیمات سفارشی کارت‌ها (اندازه فونت‌ها در دسکتاپ از قبل تنظیم شده)
  const cardsData = [
    {
      title: "موجودی تتر",
      value: balances.USDT,
      suffix: "USDT",
      bgGradient: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
      titleFontSize: "0.9rem",
      valueFontSize: "1.1rem",
      titleColor: "rgb(0, 0, 0)",
      valueColor: "rgb(0, 0, 0)",
      chartColor: "rgb(189, 3, 3)",
      sparkData: balances.USDT
        ? [
            balances.USDT * 0.9,
            balances.USDT,
            balances.USDT * 1.1,
            balances.USDT * 0.95,
            balances.USDT * 1.05,
          ]
        : [0, 0, 0, 0, 0],
    },
    {
      title: "قیمت تتر",
      value: usdPrice,
      suffix: "تومان",
      bgGradient: "linear-gradient(135deg, #fceabb, #f8b500)",
      titleFontSize: "0.9rem",
      valueFontSize: "1.1rem",
      titleColor: "rgb(0, 0, 0)",
      valueColor: "rgb(0, 0, 0)",
      chartColor: "rgb(189, 3, 3)",
      sparkData: usdPrice
        ? [
            usdPrice * 1.1,
            usdPrice,
            usdPrice * 1.2,
            usdPrice * 1.15,
            usdPrice * 1.25,
          ]
        : [0, 0, 0, 0, 0],
    },
    {
      title: "موجودی ریالی",
      value: balances.Toman,
      suffix: "تومان",
      bgGradient: "linear-gradient(135deg, #e0eafc, #cfdef3)",
      titleFontSize: "0.9rem",
      valueFontSize: "1.1rem",
      titleColor: "rgb(0, 0, 0)",
      valueColor: "rgb(0, 0, 0)",
      chartColor: "rgb(189, 3, 3)",
      sparkData: balances.Toman
        ? [
            balances.Toman * 0.9,
            balances.Toman,
            balances.Toman * 1.1,
            balances.Toman * 0.95,
            balances.Toman * 1.05,
          ]
        : [0, 0, 0, 0, 0],
    },
  ];

  const hasError = error || priceError;
  const isLoadingOverall = isLoading || priceLoading;

  return (
    <Paper
      sx={{
        width: "100%",
        minHeight: isMobile ? 80 : 100,
        borderBottom: `1px solid ${theme.palette.divider}`,
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 1,
        overflowX: "hidden",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        borderRadius: 2,
      }}
    >
      {isLoadingOverall ? (
        <Box sx={{ m: "auto" }}>
          <CircularProgress
            size={24}
            sx={{ color: theme.palette.primary.main }}
          />
        </Box>
      ) : hasError ? (
        <Typography color="error" sx={{ m: "auto" }}>
          {error || priceError || "خطا در بارگذاری اطلاعات"}
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: isMobile ? 0.5 : 2,
            width: "100%",
            overflowX: isMobile ? "auto" : "hidden",
            justifyContent: "center",
          }}
        >
          {cardsData.map((card, index) => (
            <Box key={index}>{renderCard(card)}</Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default SubHeader;
