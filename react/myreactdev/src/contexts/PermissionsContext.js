// src/contexts/PermissionsContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "../utils/axiosInstance";

export const PermissionsContext = createContext();

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissionsAndRoles = async () => {
      try {
        const [permissionsRes, rolesRes, pagesRes] = await Promise.all([
          axios.get("/permissions").catch((err) => {
            console.error(
              "Error fetching permissions:",
              err.response?.data || err.message
            );
            return { data: [] }; // Return empty array on failure
          }),
          axios.get("/roles").catch((err) => {
            console.error(
              "Error fetching roles:",
              err.response?.data || err.message
            );
            return { data: [] };
          }),
          axios.get("/pages").catch((err) => {
            console.error(
              "Error fetching pages:",
              err.response?.data || err.message
            );
            return { data: [] };
          }),
        ]);
        console.log("Permissions Response:", permissionsRes.data);
        console.log("Roles Response:", rolesRes.data);
        console.log("Pages Response:", pagesRes.data);

        setPermissions(permissionsRes.data);
        setRoles(rolesRes.data);
        setPages(pagesRes.data);
      } catch (err) {
        console.error("Unexpected error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionsAndRoles();
  }, []);

  return (
    <PermissionsContext.Provider value={{ permissions, roles, pages, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
};
