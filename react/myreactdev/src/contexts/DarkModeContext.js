import React, { createContext, useContext, useState, useEffect } from "react";

// ایجاد کانتکست برای مدیریت دارک مود
const DarkModeContext = createContext();

// ارائه‌دهنده کانتکست
export const DarkModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    // بازیابی حالت از localStorage یا تنظیم مقدار پیش‌فرض
    try {
      return localStorage.getItem("themeMode") || "light";
    } catch (error) {
      console.error("Error accessing localStorage: ", error);
      return "light";
    }
  });

  // تابع تغییر تم
  const toggleDarkMode = () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      try {
        localStorage.setItem("themeMode", newMode);
      } catch (error) {
        console.error("Error saving to localStorage: ", error);
      }
      return newMode;
    });
  };

  useEffect(() => {
    // به‌روزرسانی مقدار ذخیره‌شده در localStorage
    try {
      localStorage.setItem("themeMode", mode);
    } catch (error) {
      console.error("Error updating localStorage: ", error);
    }

    // اعمال تم به body برای تغییرات کلی ظاهر
    document.body.setAttribute("data-theme", mode);
  }, [mode]);

  return (
    <DarkModeContext.Provider value={{ mode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// هوک سفارشی برای استفاده از دارک مود
export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};
