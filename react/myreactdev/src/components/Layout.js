import React, { useState, useEffect, useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useDarkMode } from "./DarkModeContext";
import "./Layout.css";
import SubHeader from "./SubHeader"; // اضافه کردن ایمپورت SubHeader

const Layout = ({ children }) => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const { isDarkMode } = useDarkMode();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  const handleClickOutside = (event) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target) &&
      !event.target.closest(".header button")
    ) {
      setSidebarVisible(false);
    }
  };

  useEffect(() => {
    if (isSidebarVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarVisible]);

  return (
    <div className={`layout ${isDarkMode ? "dark-mode" : ""}`}>
      <Header onToggleSidebar={toggleSidebar} />
      <SubHeader /> {/* هدر دوم از فایل جداگانه */}
      <Sidebar ref={sidebarRef} isVisible={isSidebarVisible} />
      <div className="content">{children}</div>
      <Footer />
    </div>
  );
};

export default Layout;
