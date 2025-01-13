import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import AuthContext from "contexts/AuthContext";
import { tokenManager } from "utils/tokenManager";

const hasPageAccess = (userInfo, currentPage) => {
  const userRoles = (userInfo.Roles || []).map((role) =>
    role.RoleName.trim().toLowerCase()
  );
  const userPermissions = (userInfo.Permissions || []).map((perm) =>
    perm.PermissionName.trim().toLowerCase()
  );
  const pageRoles = (currentPage?.RoleName?.split(",") || []).map((role) =>
    role.trim().toLowerCase()
  );
  const pagePermissions = (currentPage?.PermissionName?.split(",") || []).map(
    (perm) => perm.trim().toLowerCase()
  );

  const roleAccess =
    pageRoles.length === 0 ||
    pageRoles.some((role) => userRoles.includes(role));
  const permissionAccess =
    pagePermissions.length === 0 ||
    pagePermissions.some((perm) => userPermissions.includes(perm));

  return roleAccess && permissionAccess;
};

const ProtectedRoute = ({ children }) => {
  const { authToken, userInfo, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      try {
        const token = tokenManager.getAccessToken();

        if (!token || !tokenManager.isTokenValid(token)) {
          console.warn("Token is invalid. Redirecting to login...");
          logout();
          return;
        }

        if (tokenManager.isTokenNearExpiry()) {
          console.log("Token near expiry. Checking for active refresh...");
          if (!tokenManager.isRefreshing) {
            console.log("Refreshing token...");
            await tokenManager.refreshAccessToken();
          } else {
            console.warn("Token refresh already in progress. Waiting...");
            await new Promise((resolve) => setTimeout(resolve, 1000)); // انتظار کوتاه
          }
        }
      } catch (error) {
        console.error("Error validating session:", error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, [logout]);

  if (isLoading) {
    console.log("Loading session validation...");
    return <div>در حال بررسی دسترسی...</div>;
  }

  if (error || !authToken || !userInfo) {
    console.error("User session invalid. Redirecting to login...");
    return <Navigate to="/login" replace />;
  }

  const currentPage = userInfo.Pages.find(
    (page) => location.pathname.toLowerCase() === page.PageURL.toLowerCase()
  );

  if (!currentPage) {
    console.error(`Page not found for: ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  if (!hasPageAccess(userInfo, currentPage)) {
    console.error(`Access denied for user to: ${location.pathname}`);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(`Access granted to: ${location.pathname}`);
  return children;
};

export default ProtectedRoute;
