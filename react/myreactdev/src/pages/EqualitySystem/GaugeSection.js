// GaugeSection.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import GaugeChart from "react-gauge-chart";
import { calculateEquality } from "./equalityCalculator";

const GaugeSection = ({ loadingDash, usersData }) => {
  const [gaugeData, setGaugeData] = useState([]);

  useEffect(() => {
    if (usersData && usersData.length > 0) {
      // استخراج تمام ارزها از usersData
      const currencySet = new Set();
      usersData.forEach((user) => {
        (user.balances || []).forEach((b) => {
          if (b.CurrencyType) currencySet.add(b.CurrencyType.toUpperCase());
        });
      });
      const currencyList = Array.from(currencySet);

      // محاسبه‌ی مقادیر برای هر ارز با استفاده از calculateEquality
      const computedData = currencyList.map((currency) =>
        calculateEquality(usersData, currency, {
          includeDebt: true,
          includeCredit: true,
          includeLoan: true,
        })
      );
      setGaugeData(computedData);
    }
  }, [usersData]);

  if (loadingDash) return <CircularProgress />;
  if (!gaugeData.length) {
    return (
      <Typography variant="body1" color="text.secondary">
        هیچ اختلافی ثبت نشده است.
      </Typography>
    );
  }

  const calcGaugePercent = (userSide, companySide) => {
    if (userSide === 0 && companySide === 0) return 0.5;
    if (companySide === 0) return userSide > 0 ? 1 : 0;
    return Math.max(0, Math.min(1, userSide / companySide / 2));
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        py: 2,
        alignItems: "center",
      }}
    >
      {gaugeData.map((disc) => {
        const percent = calcGaugePercent(disc.userSide, disc.companySide);
        const ratio =
          disc.companySide === 0
            ? disc.userSide > 0
              ? Infinity
              : 0
            : disc.userSide / disc.companySide;
        return (
          <Card
            key={disc.currency}
            sx={{
              minWidth: 260,
              flex: "0 0 auto",
              textAlign: "center",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {disc.currency}
              </Typography>
              <GaugeChart
                id={`gauge-${disc.currency}`}
                nrOfLevels={20}
                percent={percent}
                colors={["#FF5F6D", "#00FF00"]}
                arcWidth={0.3}
                needleColor="#345243"
                needleBaseColor="#345243"
                style={{ width: "180px", margin: "auto" }}
              />
              <Typography sx={{ mt: 1 }} variant="body2">
                نسبت کاربران به شرکت:{" "}
                {disc.companySide === 0 ? "∞" : ratio.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                موجودی کاربران: {disc.userSide}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                موجودی شرکت: {disc.companySide}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                اختلاف: {disc.difference}
              </Typography>
              {disc.difference !== 0 && (
                <Typography
                  sx={{ mt: 1, fontWeight: "bold" }}
                  variant="body2"
                  color="error"
                >
                  {disc.difference > 0
                    ? `تیم خرید باید ${disc.difference} ${disc.currency} تهیه کند.`
                    : `مازاد ${Math.abs(disc.difference)} ${
                        disc.currency
                      } به حساب سود منتقل شود.`}
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default GaugeSection;
