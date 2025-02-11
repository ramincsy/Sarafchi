import { createTheme } from "@mui/material/styles";

// تعریف فونت Vazirmatn
const vazirmatnFont = {
  fontFamily: "Vazirmatn",
  fontStyle: "normal",
  fontDisplay: "swap",
  fontWeight: 400,
  src: `
    url('./fonts/Vazirmatn-Regular.ttf') format('truetype')
  `,
};

// پالت مشترک
const commonPalette = {
  text: {
    disabled: "rgba(0, 0, 0, 0.38)",
  },
  divider: "rgba(0, 0, 0, 0.12)",
};

// تنظیمات استایل‌های پایه
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

// تم‌ها
const themeConfig = {
  light: {
    palette: {
      mode: "light",
      primary: {
        main: "#1976d2", // رنگ دکمه‌ها (اصلی)
        contrastText: "#ffffff", // رنگ متن دکمه‌ها
      },
      secondary: {
        main: "#dc004e", // رنگ دکمه‌ها (ثانویه)
      },
      background: {
        default: "#f8f9fa", // رنگ پس‌زمینه صفحه
        paper: "#ffffff", // رنگ پس‌زمینه کامپوننت‌ها
        header: "#ffffff", // رنگ پس‌زمینه هدر
        footer: "#f5f5f5", // رنگ پس‌زمینه فوتر
      },
      text: {
        primary: "#1a2027", // رنگ متن اصلی
        secondary: "#3f51b5", // رنگ متن ثانویه
        header: "#1a2027", // رنگ متن هدر
        footer: "#1a2027", // رنگ متن فوتر
        ...commonPalette.text,
      },
      headerBlue: {
        main: "#2196f3", // رنگ آبی هدر
        contrastText: "#ffffff", // رنگ متن متناسب با رنگ آبی هدر
      },
      buttons: {
        notification: "#ff9800", // رنگ دکمه نوتیفیکیشن
        message: "#4caf50", // رنگ دکمه پیام‌ها
        menu: "#9c27b0", // رنگ دکمه منو (همبرگر)
        profile: "#673ab7", // رنگ دکمه پروفایل
        search: "#2196f3", // رنگ دکمه جستجو
      },
      icons: {
        menu: "#9c27b0", // رنگ آیکون منو
        search: "#2196f3", // رنگ آیکون جستجو
        notification: "#ff9800", // رنگ آیکون نوتیفیکیشن
        message: "#4caf50", // رنگ آیکون پیام‌ها
        profile: "#673ab7", // رنگ آیکون پروفایل
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
      borderRadius: 4, // شعاع گوشه‌ها
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none", // حذف سایه
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: 8, // تنظیم padding
            color: "inherit", // استفاده از رنگ متن پیش‌فرض
            backgroundColor: "transparent", // حذف پس‌زمینه
            "&:hover": {
              backgroundColor: "transparent", // حذف پس‌زمینه در حالت hover
            },
            "&:focus": {
              backgroundColor: "transparent", // حذف پس‌زمینه در حالت focus
            },
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            backgroundColor: "#f44336", // رنگ نشان‌های Badge
          },
        },
      },
    },
  },
  dark: {
    palette: {
      mode: "dark",
      primary: {
        main: "#90caf9", // رنگ دکمه‌ها (اصلی)
        contrastText: "#1a2027", // رنگ متن دکمه‌ها
      },
      secondary: {
        main: "#f48fb1", // رنگ دکمه‌ها (ثانویه)
      },
      background: {
        default: "#121212", // رنگ پس‌زمینه صفحه
        paper: "#1a2027", // رنگ پس‌زمینه کامپوننت‌ها
        header: "#1a2027", // رنگ پس‌زمینه هدر
        footer: "#1a2027", // رنگ پس‌زمینه فوتر
      },
      text: {
        primary: "#ffffff", // رنگ متن اصلی
        secondary: "#b0bec5", // رنگ متن ثانویه
        header: "#ffffff", // رنگ متن هدر
        footer: "#ffffff", // رنگ متن فوتر
        disabled: "rgba(255, 255, 255, 0.5)",
      },
      headerBlue: {
        main: "#64b5f6", // رنگ آبی هدر
        contrastText: "#ffffff", // رنگ متن متناسب با رنگ آبی هدر
      },
      buttons: {
        notification: "#ffa726", // رنگ دکمه نوتیفیکیشن
        message: "#66bb6a", // رنگ دکمه پیام‌ها
        menu: "#ab47bc", // رنگ دکمه منو (همبرگر)
        profile: "#7e57c2", // رنگ دکمه پروفایل
        search: "#64b5f6", // رنگ دکمه جستجو
      },
      icons: {
        menu: "#ab47bc", // رنگ آیکون منو
        search: "#64b5f6", // رنگ آیکون جستجو
        notification: "#ffa726", // رنگ آیکون نوتیفیکیشن
        message: "#66bb6a", // رنگ آیکون پیام‌ها
        profile: "#7e57c2", // رنگ آیکون پروفایل
      },
      divider: "rgba(255, 255, 255, 0.12)",
    },
    typography: {
      fontFamily: "Vazirmatn, Roboto, Arial, sans-serif",
      h6: {
        fontSize: "1.25rem",
        fontWeight: 500,
      },
    },
    shape: {
      borderRadius: 4, // شعاع گوشه‌ها
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: "none", // حذف سایه
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            padding: 8, // تنظیم padding
            color: "inherit", // استفاده از رنگ متن پیش‌فرض
            backgroundColor: "transparent", // حذف پس‌زمینه
            "&:hover": {
              backgroundColor: "transparent", // حذف پس‌زمینه در حالت hover
            },
            "&:focus": {
              backgroundColor: "transparent", // حذف پس‌زمینه در حالت focus
            },
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            backgroundColor: "#f44336", // رنگ نشان‌های Badge
          },
        },
      },
    },
  },
};

// ایجاد تم‌ها
export const lightTheme = createTheme({
  palette: themeConfig.light.palette,
  typography: themeConfig.light.typography,
  shape: themeConfig.light.shape,
  components: {
    ...themeConfig.light.components,
    MuiCssBaseline: {
      styleOverrides: {
        ...baseStyleOverrides,
        "@global": {
          "@font-face": [vazirmatnFont], // اضافه کردن فونت Vazirmatn
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: themeConfig.dark.palette,
  typography: themeConfig.dark.typography,
  shape: themeConfig.dark.shape,
  components: {
    ...themeConfig.dark.components,
    MuiCssBaseline: {
      styleOverrides: {
        ...baseStyleOverrides,
        "@global": {
          "@font-face": [vazirmatnFont], // اضافه کردن فونت Vazirmatn
        },
      },
    },
  },
});
