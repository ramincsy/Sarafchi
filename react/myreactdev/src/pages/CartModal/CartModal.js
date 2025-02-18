// src/pages/CartModalPage.js
import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Button,
  useTheme,
} from "@mui/material";
import TransactionService from "services/TransactionService";
import WithdrawalsService from "services/WithdrawalsService";
import WithdrawalsUSDTService from "services/WithdrawalsUSDTService";
import DetailsModal from "pages/CartModal/DetailsModal";

// تابع کمکی برای بررسی امروز بودن تاریخ
const isToday = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// تابع کمکی برای واکشی داده‌ها
const fetchData = async (
  service,
  setData,
  setLoading,
  setError,
  logMessage
) => {
  try {
    const response = await service();
    const data = response.data ? response.data : response;
    console.log(logMessage, data);
    if (Array.isArray(data)) {
      setData(data);
    }
  } catch (error) {
    console.error(`Error fetching data:`, error);
    setError(`خطا در دریافت داده‌ها`);
  } finally {
    setLoading(false);
  }
};

const CartModalPage = () => {
  const theme = useTheme();

  // حالت‌های مربوط به داده‌های API و وضعیت بارگذاری/خطا
  const [transactionsData, setTransactionsData] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState(null);

  const [withdrawalsRialData, setWithdrawalsRialData] = useState([]);
  const [withdrawalsRialLoading, setWithdrawalsRialLoading] = useState(true);
  const [withdrawalsRialError, setWithdrawalsRialError] = useState(null);

  const [withdrawalsTetryData, setWithdrawalsTetryData] = useState([]);
  const [withdrawalsTetryLoading, setWithdrawalsTetryLoading] = useState(true);
  const [withdrawalsTetryError, setWithdrawalsTetryError] = useState(null);

  const [isTodayFilterEnabled, setIsTodayFilterEnabled] = useState(false);

  // واکشی داده‌ها
  useEffect(() => {
    fetchData(
      TransactionService.fetchTransactions,
      setTransactionsData,
      setTransactionsLoading,
      setTransactionsError,
      "fetchTransactions"
    );
  }, []);

  useEffect(() => {
    fetchData(
      WithdrawalsService.fetchWithdrawals,
      setWithdrawalsRialData,
      setWithdrawalsRialLoading,
      setWithdrawalsRialError,
      "fetchWithdrawalsRial"
    );
  }, []);

  useEffect(() => {
    fetchData(
      WithdrawalsUSDTService.fetchAllWithdrawals,
      setWithdrawalsTetryData,
      setWithdrawalsTetryLoading,
      setWithdrawalsTetryError,
      "fetchWithdrawalsTetry"
    );
  }, []);

  // فیلتر کردن داده‌ها بر اساس وضعیت و تاریخ
  const filterData = (data, statuses, dateField, isTodayFilterEnabled) => {
    return data.filter((item) => {
      const status = item.Status || item.status;
      const dateValue = item[dateField] || item.date;
      return (
        statuses.includes(status) &&
        dateValue &&
        (!isTodayFilterEnabled || isToday(dateValue))
      );
    });
  };

  const withdrawalsUnderReviewRial = useMemo(() => {
    return filterData(
      withdrawalsRialData,
      ["Pending", "در حال برسی"],
      "WithdrawalDateTime",
      isTodayFilterEnabled
    );
  }, [withdrawalsRialData, isTodayFilterEnabled]);

  const withdrawalsUnderReviewTetry = useMemo(() => {
    return filterData(
      withdrawalsTetryData,
      ["Pending", "در حال برسی"],
      "CreatedAt",
      isTodayFilterEnabled
    );
  }, [withdrawalsTetryData, isTodayFilterEnabled]);

  const transactionsUnderReview = useMemo(() => {
    return filterData(
      transactionsData,
      ["Pending", "در حال برسی", "Processing"],
      "TransactionDateTime",
      isTodayFilterEnabled
    );
  }, [transactionsData, isTodayFilterEnabled]);

  const completedWithdrawalsRial = useMemo(() => {
    return filterData(
      withdrawalsRialData,
      ["Approved", "Completed", "انجام شده"],
      "WithdrawalDateTime",
      isTodayFilterEnabled
    );
  }, [withdrawalsRialData, isTodayFilterEnabled]);

  const completedWithdrawalsTetry = useMemo(() => {
    return filterData(
      withdrawalsTetryData,
      ["Approved", "Completed", "انجام شده"],
      "CreatedAt",
      isTodayFilterEnabled
    );
  }, [withdrawalsTetryData, isTodayFilterEnabled]);

  const completedTransactions = useMemo(() => {
    return filterData(
      transactionsData,
      ["Completed", "انجام شده"],
      "TransactionDateTime",
      isTodayFilterEnabled
    );
  }, [transactionsData, isTodayFilterEnabled]);

  // مدیریت مودال
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalTitle, setModalTitle] = useState("");

  const handleCardClick = (data, title) => {
    setModalTitle(title);
    setModalData(data);
    setModalOpen(true);
  };

  // کامپوننت کارت
  const CardComponent = ({ title, count, loading, error, onClick }) => (
    <Card
      sx={{
        cursor: "pointer",
        textAlign: "center",
        p: 2,
        borderRadius: 8,
        backgroundColor: "rgba(0, 0, 0, 0.41)",
        color: theme.palette.common.white,
        boxShadow:
          "0px 4px 8px rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0px 8px 16px rgba(0,0,0,0.25)",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography variant="subtitle2">{title}</Typography>
        {loading ? (
          <CircularProgress size={24} />
        ) : error ? (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        ) : (
          <Typography variant="h6">{count}</Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box p={theme.spacing(2)}>
      <Typography variant="h4" gutterBottom align="center">
        داشبورد رویداد ها
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={() => setIsTodayFilterEnabled(!isTodayFilterEnabled)}
          sx={{
            backgroundColor: isTodayFilterEnabled
              ? "rgba(65, 61, 85, 0.7)"
              : "rgba(48, 4, 243, 0.49)",
            color: "#fff",
            transition: "background-color 0.3s ease, transform 0.3s ease",
            "&:hover": {
              backgroundColor: isTodayFilterEnabled
                ? "rgba(48, 4, 243, 0.28)"
                : "rgba(48, 4, 243, 0.49)",
              transform: "scale(1.05)",
            },
            borderRadius: "20px",
            boxShadow: isTodayFilterEnabled
              ? "0 4px 8px rgba(0, 0, 0, 0.2)"
              : "0 2px 4px rgba(0, 0, 0, 0.1)",
            padding: "10px 20px",
          }}
        >
          نمایش همه روزها
        </Button>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <CardComponent
            title="برداشت ریالی درحال برسی"
            count={withdrawalsUnderReviewRial.length}
            loading={withdrawalsRialLoading}
            error={withdrawalsRialError}
            onClick={() =>
              handleCardClick(
                withdrawalsUnderReviewRial,
                "برداشت ریالی درحال برسی"
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardComponent
            title="برداشت تتری درحال برسی"
            count={withdrawalsUnderReviewTetry.length}
            loading={withdrawalsTetryLoading}
            error={withdrawalsTetryError}
            onClick={() =>
              handleCardClick(
                withdrawalsUnderReviewTetry,
                "برداشت تتری درحال برسی"
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardComponent
            title="معاملات در حال برسی"
            count={transactionsUnderReview.length}
            loading={transactionsLoading}
            error={transactionsError}
            onClick={() =>
              handleCardClick(transactionsUnderReview, "معاملات در حال برسی")
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardComponent
            title="برداشت‌های ریالی انجام شده"
            count={completedWithdrawalsRial.length}
            loading={withdrawalsRialLoading}
            error={withdrawalsRialError}
            onClick={() =>
              handleCardClick(
                completedWithdrawalsRial,
                "برداشت‌های ریالی انجام شده"
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardComponent
            title="برداشت‌های تتری انجام شده"
            count={completedWithdrawalsTetry.length}
            loading={withdrawalsTetryLoading}
            error={withdrawalsTetryError}
            onClick={() =>
              handleCardClick(
                completedWithdrawalsTetry,
                "برداشت‌های تتری انجام شده"
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <CardComponent
            title="معاملات انجام شده"
            count={completedTransactions.length}
            loading={transactionsLoading}
            error={transactionsError}
            onClick={() =>
              handleCardClick(completedTransactions, "معاملات انجام شده")
            }
          />
        </Grid>
      </Grid>

      <DetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        data={modalData}
      />
    </Box>
  );
};

export default CartModalPage;
