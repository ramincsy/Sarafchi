import React, { useState, useContext } from "react";
import { useTheme } from "@mui/material/styles";
import { AppBar, Box, Toolbar, IconButton, InputBase } from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
// import MenuIcon from "@mui/icons-material/Menu";
import NotificationIcon from "components/layout/NotificationIcon";
import Sidebar from "components/layout/Sidebar";
import SubHeader from "components/layout/SubHeader";
import logo from "assets/styles/images/logo_text.png";
import Person3Icon from "@mui/icons-material/Person3";
import MenuIcon1 from "assets/styles/images/menu.png";
import { NotificationContext } from "contexts/NotificationContext";
// متغیر قابل تنظیم برای اندازه لوگو
const logoHeight = 70; // ارتفاع لوگو را اینجا تنظیم کنید
const logoContainerHeight = 64; // ارتفاع ثابت برای نوار (به عنوان مثال 64px)

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { notifications } = useContext(NotificationContext);

  // استفاده از fallback برای آیکون‌ها
  const icons = theme.palette.icons || {
    menu: "#000",
    search: "#2196f3",
    notification: "#ff9800",
    profile: "#000",
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleTitleClick = () => {
    navigate("/DashboardPage");
  };

  const handleMenuClose = () => {
    setMobileAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const goToProfile = () => {
    navigate("/ProfilePage");
    handleMenuClose();
  };

  const mobileMenuId = "primary-account-menu-mobile";

  return (
    <Box>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: "rgba(255,255,255,0.15)",
          backdropFilter: "blur(10px)",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <Toolbar
          sx={{
            minHeight: logoContainerHeight,
            justifyContent: "space-between",
          }}
        >
          <IconButton
            size="large"
            edge="start"
            aria-label="open drawer"
            onClick={toggleSidebar}
            sx={{
              mr: 5,
              color: icons.menu,
              backgroundColor: "transparent",
              "&:hover": { backgroundColor: "transparent" },
              "&:focus": { backgroundColor: "transparent" },
            }}
          >
            <img
              src={MenuIcon1}
              alt="Menu Icon"
              style={{ width: "24px", height: "24px" }}
            />
          </IconButton>

          {/* استفاده از لوگو به جای عنوان با اندازه بزرگتر */}
          <Box
            onClick={handleTitleClick}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center", // اضافه کردن این خط برای قرار دادن در وسط
              flexGrow: 1, // اضافه کردن این خط برای اشغال فضای اطراف
              height: logoContainerHeight,
              overflow: "visible",
              position: "relative",
              zIndex: 1,
            }}
          >
            <img
              src={logo}
              alt="Logo"
              style={{
                height: logoHeight,
                width: "auto",
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            />
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <IconButton
              size="large"
              aria-label="show notifications"
              onClick={handleMobileMenuOpen}
              sx={{
                color: icons.notification,
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent" },
                "&:focus": { backgroundColor: "transparent" },
              }}
            >
              <NotificationIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              onClick={goToProfile}
              sx={{
                color: icons.profile,
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent" },
                "&:focus": { backgroundColor: "transparent" },
              }}
            >
              <Person3Icon />
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show notifications"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{
                color: icons.notification,
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent" },
                "&:focus": { backgroundColor: "transparent" },
                mr: -2,
              }}
            >
              <NotificationIcon />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              onClick={goToProfile}
              sx={{
                color: icons.profile,
                backgroundColor: "transparent",
                "&:hover": { backgroundColor: "transparent" },
                "&:focus": { backgroundColor: "transparent" },
              }}
            >
              <Person3Icon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <Box sx={{ mt: 0.5 }}>
        <SubHeader />
      </Box>
    </Box>
  );
};

export default Header;
