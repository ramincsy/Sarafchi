import React, { createContext, useState } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // تابع برای اضافه کردن نوتیفیکیشن جدید
  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]); // اضافه کردن در ابتدای لیست
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, setNotifications, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
