// src/contexts/PermissionsContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "utils/axiosInstance";
import { Box, Skeleton } from "@mui/material";
export const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  // تابع برای دریافت داده‌ها
  const fetchData = async (endpoint, label) => {
    try {
      const response = await axios.get(endpoint);

      return response.data || [];
    } catch (error) {
      console.error(
        `Error fetching ${label}:`,
        error.response?.data || error.message
      );
      return [];
    }
  };

  // دریافت تمام اطلاعات (permissions, roles, pages)
  const fetchPermissionsAndRoles = async () => {
    try {
      const [permissionsRes, rolesRes, pagesRes] = await Promise.all([
        fetchData("/permissions", "Permissions"),
        fetchData("/roles", "Roles"),
        fetchData("/pages", "Pages"),
      ]);

      setPermissions(permissionsRes);
      setRoles(rolesRes);
      setPages(pagesRes);

      if (!permissionsRes.length || !rolesRes.length || !pagesRes.length) {
        console.warn(
          "One or more datasets are empty. Please check the server."
        );
      }
    } catch (error) {
      console.error("Unexpected error during data fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissionsAndRoles();
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, roles, pages, loading }}>
      {loading ? (
        <Box sx={{ p: 3 }}>
          <Skeleton variant="text" width="60%" height={40} />
          <Skeleton
            variant="rectangular"
            width="100%"
            height={200}
            sx={{ mt: 2 }}
          />
          <Skeleton variant="text" width="80%" height={40} sx={{ mt: 2 }} />
        </Box>
      ) : (
        children
      )}
    </PermissionsContext.Provider>
  );
};
