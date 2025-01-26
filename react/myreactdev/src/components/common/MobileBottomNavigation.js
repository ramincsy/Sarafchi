import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeIcon from "@mui/icons-material/Home";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import { styled } from "@mui/system";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import StorefrontIcon from "@mui/icons-material/Storefront";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
// استایل‌های سفارشی برای BottomNavigation
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
  backdropFilter: "blur(10px)",
  backgroundColor:
    theme.palette.mode === "light"
      ? "rgba(255, 255, 255, 0.7)" // پس‌زمینه شفاف برای تم لایت
      : "rgba(18, 18, 18, 0.7)", // پس‌زمینه شفاف برای تم دارک
  boxShadow: theme.shadows[4],
  borderTopLeftRadius: "20px",
  borderTopRightRadius: "20px",
  transition: "background-color 0.3s ease, box-shadow 0.3s ease",
  "& .MuiBottomNavigationAction-root": {
    color:
      theme.palette.mode === "light"
        ? theme.palette.text.secondary // رنگ متن برای تم لایت
        : theme.palette.text.primary, // رنگ متن برای تم دارک
    transition: "color 0.3s ease",
    "&.Mui-selected": {
      color: theme.palette.primary.main, // رنگ آیکون و متن در حالت فعال
    },
  },
}));

const MobileBottomNavigation = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm")); // استفاده از breakpoints تم
  const navigate = useNavigate();

  // تعیین مقدار فعال بر اساس مسیر فعلی
  const getActiveValue = () => {
    switch (location.pathname) {
      case "/home":
        return 0;
      case "/favorites":
        return 1;
      case "/search":
        return 2;
      case "/profile":
        return 3;
      default:
        return 0;
    }
  };

  const [value, setValue] = React.useState(getActiveValue());

  if (!isMobile) return null; // فقط برای موبایل نمایش داده شود

  return (
    <Box
      sx={{
        width: "100%",
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      <StyledBottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue);
          switch (newValue) {
            case 0:
              navigate("/WithdrawPage");
              break;
            case 1:
              navigate("/automatic-transaction");
              break;
            case 2:
              navigate("/balances");
              break;
            case 3:
              navigate("/ProfilePage");
              break;
            default:
              break;
          }
        }}
      >
        <BottomNavigationAction
          label="برداشت ها"
          icon={<MonetizationOnIcon />}
        />
        <BottomNavigationAction label="سفارش گزاری" icon={<StorefrontIcon />} />
        <BottomNavigationAction
          label="موجودی"
          icon={<AccountBalanceWalletIcon />}
        />
        <BottomNavigationAction label="پروفایل" icon={<PersonIcon />} />
      </StyledBottomNavigation>
    </Box>
  );
};

export default MobileBottomNavigation;
