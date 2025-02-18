// themes.js
import { createTheme } from "@mui/material/styles";

// تعریف فونت Vazirmatn
const vazirmatnFont = {
  fontFamily: "Vazirmatn",
  fontStyle: "normal",
  fontDisplay: "swap",
  fontWeight: 400,
  src: `url('./fonts/Vazirmatn-Regular.ttf') format('truetype')`,
};

// تنظیمات استایل‌های پایه (global)
const baseStyleOverrides = {
  "*": {
    margin: 0,
    padding: 0,
    boxSizing: "border-box",
  },
  body: {
    fontFamily: "Vazirmatn, Roboto, Arial, sans-serif",
    lineHeight: 1.6,
    transition: "background-color 0.3s ease, color 0.3s ease",
  },
  a: {
    textDecoration: "none",
    transition: "color 0.3s ease",
  },
  button: {
    borderRadius: 8,
    padding: "10px 16px",
    fontSize: "1rem",
    cursor: "pointer",
    border: "none",
    transition:
      "background-color 0.3s ease, color 0.3s ease, transform 0.2s ease",
  },
};

// تنظیمات افکت شیشه‌ای (glass effect)
const glassEffect = {
  background: "rgba(255, 255, 255, 0.15)",
  backdropFilter: "blur(10px)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px 0 rgba(31,38,135,0.37)",
};

// ایجاد یک تم شیشه‌ای ثابت
export const glassTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#dc004e",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff", // رنگ اولیه Paper؛ اما ما override آن می‌کنیم
      header: "#ffffff",
      footer: "#f5f5f5",
    },
    text: {
      primary: "#1a2027",
      secondary: "#3f51b5",
    },
    divider: "rgba(0, 0, 0, 0.12)",
  },
  typography: {
    fontFamily: "Vazirmatn, Roboto, Arial, sans-serif",
    h6: {
      fontSize: "1.25rem",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...baseStyleOverrides,
        "@global": {
          "@font-face": [vazirmatnFont],
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: glassEffect,
      },
    },
    // در صورت نیاز می‌توانید overrideهای اضافی برای سایر کامپوننت‌هایی که از Paper استفاده می‌کنند (Dialog، Card و ...) اضافه کنید.
  },
});

// در صورت نیاز به استفاده از خروجی‌های lightTheme و darkTheme به عنوان نام‌های دیگر، می‌توانیم آن‌ها را به صورت زیر صادر کنیم:
export const lightTheme = glassTheme;
export const darkTheme = glassTheme;
