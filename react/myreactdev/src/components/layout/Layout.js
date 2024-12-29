import React, { useState, useEffect, useRef, useMemo } from "react";
import { Box, CssBaseline, useTheme, useMediaQuery } from "@mui/material";
import Header from "components/layout/Header";
import Footer from "components/layout/Footer";
import MobileBottomNavigation from "components/common/MobileBottomNavigation";
import { useDarkMode } from "contexts/DarkModeContext";

const Layout = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const { mode } = useDarkMode();
  const sidebarRef = useRef(null);
  const theme = useTheme();

  // Use breakpoints from theme for consistency
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Memoize styles to prevent unnecessary recalculations
  const styles = useMemo(
    () => ({
      root: {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor:
          mode === "dark"
            ? theme.palette.background.default
            : theme.palette.grey[100],
      },
      main: {
        flexGrow: 1,
        padding: theme.spacing(3),
        backgroundColor:
          mode === "dark"
            ? theme.palette.background.default
            : theme.palette.common.white,
        transition: theme.transitions.create(["background-color"], {
          duration: theme.transitions.duration.standard,
        }),
      },
    }),
    [mode, theme]
  );

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
  };

  // Improved click outside handler with proper cleanup
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".MuiIconButton-root")
      ) {
        setSidebarVisible(false);
      }
    };

    if (isSidebarVisible) {
      // Use capture phase for better event handling
      document.addEventListener("mousedown", handleClickOutside, true);
      // Add escape key handler
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

  // Prevent scroll when sidebar is open on mobile
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
