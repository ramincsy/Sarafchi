// src/components/ProtectedRoute.js
import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Current location pathname (useEffect):", location.pathname);
    // دریافت اطلاعات کاربر از localStorage
    const storedUser = JSON.parse(localStorage.getItem("user_info"));

    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // در حال بارگذاری داده‌ها
  if (isLoading) {
    return <div>در حال بارگذاری...</div>;
  }

  // بررسی توکن احراز هویت
  if (!authToken && !localStorage.getItem("access_token")) {
    return <Navigate to="/login" replace />;
  }

  // یافتن اطلاعات صفحه جاری
  console.log("Current location pathname:", location.pathname);
  console.log("User pages:", user.pages);

  const currentPage = user?.pages?.find((page) =>
    location.pathname.startsWith(page.PageURL)
  );

  if (!currentPage) {
    console.error("صفحه مورد نظر یافت نشد:", location.pathname);
    return <Navigate to="/unauthorized" replace />;
  }

  // بررسی نقش‌ها و مجوزهای کاربر
  const userRoles = user?.roles || [];
  const userPermissions = user?.permissions || [];
  const pageRoles = currentPage.Roles?.split(", ") || [];
  const pagePermissions = currentPage.Permissions?.split(", ") || [];

  const hasRoleAccess =
    pageRoles.length === 0 ||
    pageRoles.some((role) => userRoles.includes(role));

  const hasPermissionAccess =
    pagePermissions.length === 0 ||
    pagePermissions.some((permission) => userPermissions.includes(permission));

  console.log("User roles:", userRoles);
  console.log("User permissions:", userPermissions);
  console.log("Page roles:", pageRoles);
  console.log("Page permissions:", pagePermissions);

  if (!hasRoleAccess) {
    console.error("User lacks role access for page:", pageRoles);
  }
  if (!hasPermissionAccess) {
    console.error("User lacks permission access for page:", pagePermissions);
  }

  return children;
};

export default ProtectedRoute;
