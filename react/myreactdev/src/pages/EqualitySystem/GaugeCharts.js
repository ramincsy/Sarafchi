// src/components/GaugeCharts.js

import React from "react";
import { Grid, Card, CardContent, Typography } from "@mui/material";
import GaugeChart from "react-gauge-chart";

const GaugeCharts = ({ discrepancies }) => {
  const calcGaugePercent = (userBalance, companyBalance) => {
    if (userBalance === 0 && companyBalance === 0) return 0.5;
    if (companyBalance === 0) return userBalance > 0 ? 1 : 0;
    return Math.max(0, Math.min(1, userBalance / companyBalance / 2));
  };

  return (
    <Grid container spacing={2}>
      {discrepancies.map((disc, index) => {
        const percent = calcGaugePercent(
          disc.user_balance,
          disc.company_balance
        );
        const ratio =
          disc.company_balance === 0
            ? disc.user_balance > 0
              ? Infinity
              : 0
            : disc.user_balance / disc.company_balance;
        return (
          <Grid item xs={12} md={4} key={index}>
            <Card>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6">{disc.currency}</Typography>
                <GaugeChart
                  id={`gauge-${disc.currency}`}
                  nrOfLevels={20}
                  percent={percent}
                  arcWidth={0.3}
                  needleColor="#345243"
                  needleBaseColor="#345243"
                  style={{ width: "180px", margin: "auto" }}
                />
                <Typography variant="body2">
                  نسبت: {disc.company_balance === 0 ? "∞" : ratio.toFixed(2)}
                </Typography>
                <Typography variant="body2">
                  کاربران: {disc.user_balance}
                </Typography>
                <Typography variant="body2">
                  شرکت: {disc.company_balance}
                </Typography>
                <Typography variant="body2">
                  اختلاف: {disc.difference}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
};

export default GaugeCharts;
