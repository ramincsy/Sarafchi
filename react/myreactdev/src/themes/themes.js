import { createTheme } from "@mui/material/styles";
import fontConfig from "./fontConfig"; // ایمپورت فونت‌ها

// تم روشن
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", // رنگ دکمه‌ها (اصلی)
      contrastText: "#ffffff", // رنگ متن دکمه‌ها
    },
    background: {
      default: "#f8f9fa", // رنگ پس‌زمینه صفحه
      paper: "#f8f9fa", // رنگ پس‌زمینه هدر، فوتر و سایدبار
    },
    text: {
      primary: "#1a2027",
      disabled: "rgba(0, 0, 0, 0.38)",
    },
    divider: "rgba(0, 0, 0, 0.12)",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          fontFamily: fontConfig.primary, // استفاده از فونت برای کل عناصر
        },
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: "#f8f9fa", // رنگ پیش‌زمینه برای کل سایت
          color: "#1a2027", // رنگ متن پیش‌فرض
        },
      },
    },
  },
});

// تم تاریک
export const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#eda900", // رنگ دکمه‌ها (اصلی)
      contrastText: "#1a2027", // رنگ متن دکمه‌ها
    },
    background: {
      default: "#1a2027", // رنگ پس‌زمینه صفحه
      paper: "#1a2027", // رنگ پس‌زمینه هدر، فوتر و سایدبار
    },
    text: {
      primary: "#ffffff",
      secondary: "#b0bec5",
      disabled: "rgba(255, 255, 255, 0.5)",
    },
    divider: "rgba(255, 255, 255, 0.12)",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          fontFamily: fontConfig.primary, // استفاده از فونت برای کل عناصر
        },
        body: {
          margin: 0,
          padding: 0,
          backgroundColor: "#1a2027", // رنگ پیش‌زمینه برای کل سایت
          color: "#ffffff", // رنگ متن پیش‌فرض
        },
      },
    },
  },
});
