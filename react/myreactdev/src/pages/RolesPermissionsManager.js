import React from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import UserRoleManager from "pages/UserRoleManagement";
import PermissionManagement from "pages/PermissionManagement";
import RoleManagement from "pages/RoleManagement";

const RolesPermissionsManager = () => {
  const theme = useTheme();

  const boxStyles = {
    height: "calc(100vh - 180px)",
    display: "flex",
    flexDirection: "column",
    boxShadow: 3,
    borderRadius: 2,
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  };

  const headerStyles = {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    padding: "8px 12px", // Reduced padding
    flexShrink: 0,
  };

  const contentStyles = {
    flex: 1,
    overflow: "auto",
    padding: "0px", // Minimized padding
    "& .MuiTableContainer-root": {
      margin: 0,
      padding: 0,
    },
    "& .MuiTable-root": {
      width: "100%",
      margin: 0,
      padding: 0,
    },
    "& .MuiTableCell-root": {
      padding: "0px 0px", // Reduced cell padding
    },
  };

  return (
    <Box
      sx={{
        padding: 2, // Reduced outer padding
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        textAlign="center"
        sx={{
          marginBottom: 2,
          fontWeight: "bold",
        }}
      >
        مدیریت نقش‌ها، مجوزها و کاربران
      </Typography>

      <Grid
        container
        spacing={2} // Reduced grid spacing
        sx={{
          height: "calc(100vh - 100px)",
        }}
      >
        {/* بخش مدیریت نقش‌ها */}
        <Grid item xs={12} md={6} lg={4}>
          <Box sx={boxStyles}>
            <Typography variant="h6" sx={headerStyles}>
              مدیریت نقش‌ها
            </Typography>
            <Box sx={contentStyles} className="table-wrapper">
              <RoleManagement
                height="100%"
                width="100%"
                dense // Add dense prop if your components support it
              />
            </Box>
          </Box>
        </Grid>

        {/* بخش مدیریت مجوزها */}
        <Grid item xs={12} md={6} lg={4}>
          <Box sx={boxStyles}>
            <Typography variant="h6" sx={headerStyles}>
              مدیریت مجوزها
            </Typography>
            <Box sx={contentStyles} className="table-wrapper">
              <PermissionManagement height="100%" width="100%" dense />
            </Box>
          </Box>
        </Grid>

        {/* بخش مدیریت کاربران و نقش‌ها */}
        <Grid item xs={12} lg={4}>
          <Box sx={boxStyles}>
            <Typography variant="h6" sx={headerStyles}>
              مدیریت نقش‌های کاربران
            </Typography>
            <Box sx={contentStyles} className="table-wrapper">
              <UserRoleManager height="100%" width="100%" dense />
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RolesPermissionsManager;
