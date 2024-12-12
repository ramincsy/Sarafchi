import React from "react";
import { FaMoon, FaSun, FaBell, FaBars, FaUser } from "react-icons/fa";
import { useDarkMode } from "./DarkModeContext";
import "./Header.css";

const Header = ({ onToggleSidebar }) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className={`header ${isDarkMode ? "dark-mode" : ""}`}>
      <button className="icon-btn" onClick={onToggleSidebar}>
        <FaBars />
      </button>
      <h1 className="header-title">صرافچی</h1>
      <div className="header-icons">
        <button className="icon-btn">
          <FaBell />
        </button>
        <button className="icon-btn" onClick={toggleDarkMode}>
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        <button className="icon-btn user-icon">
          <FaUser />
        </button>
      </div>
    </header>
  );
};

export default Header;
