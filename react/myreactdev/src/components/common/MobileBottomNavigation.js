import React, { useEffect } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { styled } from "@mui/system";
import { useNavigate, useLocation } from "react-router-dom";

// آیکون‌ها
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PersonIcon from "@mui/icons-material/Person";

// لیست گزینه‌ها
const navigationItems = [
  {
    label: "برداشت ها",
    icon: <MonetizationOnIcon />,
    path: "/WithdrawPage",
  },
  {
    label: "معاملات",
    icon: <StorefrontIcon />,
    path: "/automatic-transaction",
  },
  {
    label: "موجودی",
    icon: <AccountBalanceWalletIcon />,
    path: "/balances",
  },
  {
    label: "پروفایل",
    icon: <PersonIcon />,
    path: "/ProfilePage",
  },
];

// استایل‌های سفارشی برای BottomNavigation
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  position: "fixed",
  bottom: 5, // فاصله کمتر از پایین صفحه
  left: "50%",
  transform: "translateX(-50%)", // مرکز کردن
  width: "95%", // عرض مناسب برای بیضی
  maxWidth: 400,
  borderRadius: "50px", // شکل بیضی کامل
  backdropFilter: "blur(5px)",
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.54)"
      : "rgba(30, 30, 30, 0.9)",
  boxShadow: theme.shadows[6],
  transition: "all 0.3s ease",
  zIndex: 1000,

  "& .MuiBottomNavigationAction-root": {
    color: theme.palette.text.secondary, // رنگ متن غیرفعال
    transition:
      "color 0.3s ease, transform 0.3s ease, font-size 0.3s ease, font-weight 0.3s ease",

    // تنظیمات پیش‌فرض برای تمام دکمه‌ها
    height: 60, // افزایش ارتفاع دکمه‌ها
    padding: "8px 16px", // افزایش فاصله داخلی
    fontSize: "18px", // اندازه فونت پیش‌فرض
    fontWeight: 900, // وزن فونت پیش‌فرض

    "&.Mui-selected": {
      color: "#000", // رنگ فعال (نارنجی)
      fontSize: "20px", // اندازه فونت بزرگ‌تر در حالت فعال
      fontWeight: 1000, // وزن فونت کلفت‌تر در حالت فعال
      transform: "scale(1.1)", // انیمیشن بزرگ‌تر شدن
      // backgroundColor: "rgba(255, 87, 34, 0.1)", // پس‌زمینه نرم برای منوی فعال
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // ظل برای برجستگی
    },
  },
}));

const MobileBottomNavigation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // فقط برای دستگاه‌های موبایل
  const navigate = useNavigate();
  const location = useLocation();

  const [value, setValue] = React.useState(0);

  // تعیین مقدار فعال بر اساس مسیر فعلی
  useEffect(() => {
    const findActiveIndex = navigationItems.findIndex((item) =>
      location.pathname.includes(item.path)
    );
    setValue(findActiveIndex !== -1 ? findActiveIndex : 0);
  }, [location]);

  if (!isMobile) return null; // فقط برای موبایل نمایش داده شود

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        position: "relative",
      }}
    >
      <StyledBottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          navigate(navigationItems[newValue].path);
        }}
      >
        {navigationItems.map((item, index) => (
          <BottomNavigationAction
            key={index}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </StyledBottomNavigation>
    </Box>
  );
};

export default MobileBottomNavigation;
