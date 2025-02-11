import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  MenuItem,
  Select,
  useTheme,
} from "@mui/material";
import RolesPermissionsService from "services/RolesPermissionsService";

const RoleManagement = () => {
  const theme = useTheme();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");
  const [rolePermissions, setRolePermissions] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRolesAndPermissions = async () => {
      try {
        const [rolesData, permissionsData] = await Promise.all([
          RolesPermissionsService.fetchRolesWithPermissions(),
          RolesPermissionsService.fetchPermissions(),
        ]);

        const formattedRolePermissions = rolesData.reduce((acc, role) => {
          acc[role.RoleID] = role.Permissions;
          return acc;
        }, {});

        setRoles(
          rolesData.map((role) => ({
            RoleID: role.RoleID,
            RoleName: role.RoleName,
          }))
        );
        setPermissions(permissionsData);
        setRolePermissions(formattedRolePermissions);
      } catch (err) {
        setError("خطا در دریافت داده‌ها.");
      }
    };

    fetchRolesAndPermissions();
  }, []);

  const handleAddRole = async () => {
    if (!newRole) {
      setError("نام نقش نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await RolesPermissionsService.addRole(newRole);
      setNewRole("");
      setRoles([...roles, { RoleID: roles.length + 1, RoleName: newRole }]);
    } catch (err) {
      setError("خطا در افزودن نقش.");
    }
  };

  const handleAssignPermissionToRole = async (roleId, permissionId) => {
    try {
      await RolesPermissionsService.assignPermissionToRole(
        roleId,
        permissionId
      );
      setRolePermissions((prev) => ({
        ...prev,
        [roleId]: [
          ...(prev[roleId] || []),
          permissions.find((p) => p.PermissionID === permissionId),
        ],
      }));
    } catch (err) {
      setError("خطا در تخصیص مجوز به نقش.");
    }
  };

  const handleRemovePermissionFromRole = async (roleId, permissionId) => {
    try {
      await RolesPermissionsService.removePermissionFromRole(
        roleId,
        permissionId
      );
      setRolePermissions((prev) => ({
        ...prev,
        [roleId]: prev[roleId]?.filter((p) => p.PermissionID !== permissionId),
      }));
    } catch (err) {
      setError("خطا در حذف مجوز از نقش.");
    }
  };

  const handleDeleteRole = async (roleId) => {
    try {
      await RolesPermissionsService.deleteRole(roleId);
      setRoles(roles.filter((role) => role.RoleID !== roleId));
      const updatedPermissions = { ...rolePermissions };
      delete updatedPermissions[roleId];
      setRolePermissions(updatedPermissions);
    } catch (err) {
      setError("خطا در حذف نقش.");
    }
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom>
        مدیریت نقش‌ها
      </Typography>

      {error && (
        <Typography color="error" textAlign="center" gutterBottom>
          {error}
        </Typography>
      )}

      <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 4 }}>
        <Grid item xs={12} sm={9}>
          <TextField
            fullWidth
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            placeholder="نام نقش جدید"
            label="نام نقش جدید"
            sx={{ backgroundColor: theme.palette.background.paper }}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddRole}
          >
            افزودن نقش
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableRow>
              <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                شناسه نقش
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                نام نقش
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                مجوزها
              </TableCell>
              <TableCell
                align="center"
                sx={{ color: theme.palette.primary.contrastText }}
              >
                عملیات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.RoleID}>
                <TableCell>{role.RoleID}</TableCell>
                <TableCell>{role.RoleName}</TableCell>
                <TableCell>
                  {rolePermissions[role.RoleID]?.length > 0 ? (
                    rolePermissions[role.RoleID].map((permission) => (
                      <Typography
                        key={permission.PermissionID}
                        sx={{
                          display: "inline-block",
                          backgroundColor: theme.palette.info.light,
                          padding: "4px 8px",
                          borderRadius: "8px",
                          margin: "2px",
                        }}
                      >
                        {permission.PermissionName}
                      </Typography>
                    ))
                  ) : (
                    <Typography color="textSecondary">بدون مجوز</Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  <Select
                    value={selectedPermission}
                    onChange={(e) => setSelectedPermission(e.target.value)}
                    displayEmpty
                    sx={{ width: 150, marginRight: 1 }}
                  >
                    <MenuItem value="">انتخاب مجوز</MenuItem>
                    {permissions.map((permission) => (
                      <MenuItem
                        key={permission.PermissionID}
                        value={permission.PermissionID}
                      >
                        {permission.PermissionName}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() =>
                      handleAssignPermissionToRole(
                        role.RoleID,
                        parseInt(selectedPermission)
                      )
                    }
                  >
                    افزودن مجوز
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      handleRemovePermissionFromRole(
                        role.RoleID,
                        parseInt(selectedPermission)
                      )
                    }
                    sx={{ marginLeft: 1 }}
                  >
                    حذف مجوز
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDeleteRole(role.RoleID)}
                    sx={{ marginLeft: 1 }}
                  >
                    حذف نقش
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RoleManagement;
