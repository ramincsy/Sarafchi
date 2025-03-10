import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { Box, CssBaseline, useTheme, useMediaQuery } from "@mui/material";
import Header from "components/layout/Header";
import Footer from "components/layout/Footer";
import MobileBottomNavigation from "components/common/MobileBottomNavigation";

const Layout = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const sidebarRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // استفاده از استایل‌های شیشه‌ای ثابت در کل صفحه
  const styles = useMemo(
    () => ({
      root: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "transparent", // پس‌زمینه شیشه‌ای (شیشه‌ای بودن پس‌زمینه در سطح global تعیین شده است)
      },
      main: {
        flexGrow: 1,
        padding: theme.spacing(3),
        backgroundColor: "transparent", // پس‌زمینه شیشه‌ای برای بخش main
        transition: theme.transitions.create(["background-color"], {
          duration: theme.transitions.duration.standard,
        }),
      },
      sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "250px",
        height: "100vh",
        backgroundColor: "rgba(255,255,255,0.15)", // افکت شیشه‌ای ثابت
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.2)",
        boxShadow: theme.shadows[4],
        transform: isSidebarVisible ? "translateX(0)" : "translateX(-100%)",
        transition: theme.transitions.create(["transform"], {
          duration: theme.transitions.duration.standard,
        }),
        zIndex: theme.zIndex.drawer,
      },
      overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: theme.zIndex.drawer - 1,
        display: isSidebarVisible ? "block" : "none",
      },
    }),
    [theme, isSidebarVisible]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarVisible(false);
      }
    };

    if (isSidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside, true);
      const handleEscape = (event) => {
        if (event.key === "Escape") {
          setSidebarVisible(false);
        }
      };
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside, true);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isSidebarVisible]);

  useEffect(() => {
    if (isMobile && isSidebarVisible) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isMobile, isSidebarVisible]);

  return (
    <Box sx={styles.root}>
      <CssBaseline />

      <Header
        onToggleSidebar={toggleSidebar}
        isSidebarVisible={isSidebarVisible}
      />

      {isSidebarVisible && <Box sx={styles.overlay} onClick={toggleSidebar} />}
      <Box ref={sidebarRef} sx={styles.sidebar}>
        {/* Sidebar Content */}
      </Box>
      <Box
        component="main"
        sx={styles.main}
        role="main"
        aria-label="main content"
      >
        {children}
      </Box>
      {isMobile ? <MobileBottomNavigation /> : <Footer />}
    </Box>
  );
};

export default Layout;
