import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
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

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        transition: theme.transitions.create(["background-color"], {
          duration: theme.transitions.duration.standard,
        }),
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
      sidebar: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "250px",
        height: "100vh",
        backgroundColor: theme.palette.background.paper,
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
    [mode, theme, isSidebarVisible]
  );

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev);
  }, []);

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

      {/* Sidebar Overlay */}
      {isSidebarVisible && <Box sx={styles.overlay} onClick={toggleSidebar} />}

      {/* Sidebar */}
      <Box ref={sidebarRef} sx={styles.sidebar}>
        {/* Sidebar Content */}
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={styles.main}
        role="main"
        aria-label="main content"
      >
        {children}
      </Box>

      {/* Footer or Mobile Navigation */}
      {isMobile ? <MobileBottomNavigation /> : <Footer />}
    </Box>
  );
};

export default Layout;
