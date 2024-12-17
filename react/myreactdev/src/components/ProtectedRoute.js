import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authToken } = useContext(AuthContext);

  // بررسی توکن احراز هویت و اطلاعات کاربر
  const isAuthenticated =
    authToken ||
    (localStorage.getItem("access_token") && localStorage.getItem("user_info"));

  // در صورت عدم احراز هویت، کاربر به صفحه لاگین هدایت می‌شود
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
