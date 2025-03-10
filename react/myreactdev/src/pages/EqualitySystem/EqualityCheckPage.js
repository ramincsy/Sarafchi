// EqualityCheckPage.js
import React, { useEffect, useState } from "react";
import { Container, Typography, Paper, Alert } from "@mui/material";

import GaugeSection from "./GaugeSection";
import SideBySideEqualityTables from "./EqualitySideBySideTables";
import EqualityDataService from "services/EqualityDataService";
import FinancialDashboardService from "services/FinancialDashboardService";

const EqualityCheckPage = () => {
  const [usersData, setUsersData] = useState([]);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);

  // گرفتن کاربر + بالانس + نقش
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await EqualityDataService.fetchEqualityData();
        if (res.success) {
          setUsersData(res.data);
        } else {
          setError(res.error || "خطا در گرفتن دادهٔ کاربران");
        }
      } catch (err) {
        setError("ارتباط با سرور(کاربران) ناموفق بود");
      }
    };
    fetchUsers();
  }, []);

  // گرفتن داده‌های داشبورد (برای گیج)
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoadingDash(true);
        const res = await FinancialDashboardService.fetchOverview();
        setDashboardData(res);
      } catch (err) {
        setError("ارتباط با سرور(داشبورد) ناموفق بود");
      } finally {
        setLoadingDash(false);
      }
    };
    fetchOverview();
  }, []);

  return (
    <Container sx={{ mt: 3, mb: 5 }}>
      <Typography variant="h5" mb={2} fontWeight="bold">
        سیستم برابری با 3 جدول (سمت شرکت / سمت کاربران / مستثنی) و تمام ارزها
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      {/* بخش گیج */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6">نمودار اختلاف موجودی</Typography>
        <GaugeSection
          loadingDash={loadingDash}
          usersData={usersData}
          // اگر resultToman, resultUsdt دارید، اینجا پاس کنید
          resultToman={null}
          resultUsdt={null}
        />
      </Paper>

      {/* سه جدول کنار هم، با تمام ارزهای شناخته‌شده */}
      <SideBySideEqualityTables usersData={usersData} />
    </Container>
  );
};

export default EqualityCheckPage;
