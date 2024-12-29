import React, { useState } from "react";
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  useTheme,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Avatar,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import BarChartIcon from "@mui/icons-material/BarChart";
import SettingsIcon from "@mui/icons-material/Settings";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = () => {
  const theme = useTheme();
  const [openBoxes, setOpenBoxes] = useState({
    balance: false,
    openTrades: false,
    closedTrades: false,
    suggestedTrades: false,
    liveTrades: false,
    chart: false,
  });

  const toggleBox = (boxName) => {
    setOpenBoxes((prevState) => ({
      ...prevState,
      [boxName]: !prevState[boxName],
    }));
  };

  const balanceData = {
    toman: 12000000,
    tether: 500,
    dollar: 2000,
    yuan: 8000,
  };

  const chartData = {
    labels: [
      "7 روز پیش",
      "6 روز پیش",
      "5 روز پیش",
      "4 روز پیش",
      "3 روز پیش",
      "2 روز پیش",
      "دیروز",
    ],
    datasets: [
      {
        label: "تعداد معاملات",
        data: [5, 8, 4, 6, 7, 9, 12],
        backgroundColor: theme.palette.primary.main,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "معاملات 7 روز گذشته",
      },
    },
  };

  const sections = [
    {
      key: "balance",
      title: "موجودی‌ها",
      icon: <AccountCircleIcon />,
      content: (
        <Box>
          <Typography>
            تومان: {balanceData.toman.toLocaleString()} تومان
          </Typography>
          <Typography>تتر: {balanceData.tether} USDT</Typography>
          <Typography>دلار: {balanceData.dollar} USD</Typography>
          <Typography>یوان: {balanceData.yuan} CNY</Typography>
        </Box>
      ),
    },
    {
      key: "openTrades",
      title: "معاملات باز",
      icon: <BarChartIcon />,
      content: <Typography>تعداد: 5 معامله</Typography>,
    },
    {
      key: "closedTrades",
      title: "معاملات بسته شده",
      icon: <BarChartIcon />,
      content: <Typography>تعداد: 10 معامله</Typography>,
    },
    {
      key: "suggestedTrades",
      title: "معاملات پیشنهادی",
      icon: <BarChartIcon />,
      content: <Typography>تعداد: 3 پیشنهاد</Typography>,
    },
    {
      key: "liveTrades",
      title: "معاملات برخط",
      icon: <BarChartIcon />,
      content: <Typography>تعداد: 2 معامله</Typography>,
    },
    {
      key: "chart",
      title: "تعداد معاملات 7 روز گذشته",
      icon: <BarChartIcon />,
      content: <Bar data={chartData} options={chartOptions} />,
    },
  ];

  return (
    <Box sx={{ padding: 4, backgroundColor: theme.palette.background.default }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontFamily: theme.typography.fontFamily }}
      >
        داشبورد کاربری
      </Typography>
      <Grid container spacing={3}>
        {sections.map((section) => (
          <Grid item xs={12} md={6} key={section.key}>
            <Card>
              <CardHeader
                avatar={<Avatar>{section.icon}</Avatar>}
                action={
                  <IconButton onClick={() => toggleBox(section.key)}>
                    {openBoxes[section.key] ? (
                      <ExpandLessIcon />
                    ) : (
                      <ExpandMoreIcon />
                    )}
                  </IconButton>
                }
                title={section.title}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                }}
              />
              <Collapse in={openBoxes[section.key]}>
                <CardContent>{section.content}</CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Card>
            <CardHeader
              avatar={
                <Avatar>
                  <SettingsIcon />
                </Avatar>
              }
              title="تنظیمات کاربری"
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
              }}
            />
            <CardContent>
              <Typography>تنظیمات خود را اینجا مدیریت کنید.</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
