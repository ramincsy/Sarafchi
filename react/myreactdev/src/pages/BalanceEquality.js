// BalanceEquality.jsx
import React, { useState, useEffect } from "react";
import GaugeChart from "react-gauge-chart";
import { Box, Typography, CircularProgress } from "@mui/material";
import FinancialDashboardService from "services/FinancialDashboardService";

const BalanceEquality = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // هنگام لود کامپوننت، داده‌ها را از API می‌گیریم
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // از همان متد موجود در FinancialDashboardService استفاده می‌کنیم
      const response = await FinancialDashboardService.fetchOverview();
      setData(response);
    } catch (error) {
      console.error("خطا در دریافت داده‌های برابری:", error);
    } finally {
      setLoading(false);
    }
  };

  // اگر در حال لود هستیم
  if (loading) {
    return (
      <Box sx={{ textAlign: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // اگر داده‌ای نداریم
  if (!data) {
    return <Typography>داده‌ای برای نمایش وجود ندارد</Typography>;
  }

  // فرض بر این است که در data.discrepancies آرایه‌ای از ارزها و اختلاف موجودی آن‌ها موجود است
  // هر عنصر دارای فیلدهایی مثل: currencyType, userBalance, exchangeBalance, difference
  // برای نمایش گیج، بهتر است نسبت (ratio) را محاسبه کنیم: userBalance / exchangeBalance
  // سپس این نسبت را به مقداری بین 0 و 1 (یا 0 تا 2) تبدیل می‌کنیم تا در گیج نمایش دهیم

  const { discrepancies } = data;
  console.log(data);

  // اگر discrepancies وجود نداشت یا خالی بود
  if (!discrepancies || discrepancies.length === 0) {
    return <Typography>هیچ اختلافی ثبت نشده است</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h4" gutterBottom>
        سیستم برابری
      </Typography>
      {discrepancies.map((disc, idx) => {
        const userBal = disc.userBalance;
        const exBal = disc.exchangeBalance;

        // محاسبه نسبت (ممکن است exBal صفر باشد؛ حتماً هندل شود)
        let ratio = 0;
        if (exBal !== 0) {
          ratio = userBal / exBal;
        }

        // اگر بخواهیم مقدار گیج را بین 0 و 1 محدود کنیم:
        // مثلاً اگر ratio = 1 یعنی تراز ایده‌آل، اگر بیشتر از 1 یعنی کاربر بیشتر از صرافی دارد
        // برای نمایش در گیج، percent باید بین 0 و 1 باشد:
        let percent = ratio;
        if (percent > 1) percent = 1;
        if (percent < 0) percent = 0;

        return (
          <Box
            key={idx}
            sx={{
              border: "1px solid #ddd",
              borderRadius: 2,
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant="h6" gutterBottom>
              ارز: {disc.currencyType}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <GaugeChart
                id={`balance-gauge-${idx}`}
                nrOfLevels={20}
                percent={percent}
                colors={["#FF5F6D", "#FFC371"]}
                arcWidth={0.3}
                textColor="#000"
                needleColor="#345243"
                needleBaseColor="#345243"
                style={{ width: "250px" }}
              />

              {/* نمایش جزئیات نسبت و اختلاف */}
              <Typography sx={{ mt: 2 }}>
                نسبت کاربر به صرافی: {ratio.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                موجودی کاربر: {disc.userBalance} | موجودی صرافی:{" "}
                {disc.exchangeBalance}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                اختلاف: {disc.difference}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default BalanceEquality;
