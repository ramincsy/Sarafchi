import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Select,
  MenuItem,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import RolesPermissionsService from "services/RolesPermissionsService";

const UserRoleManager = () => {
  const theme = useTheme();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsersAndRoles = async () => {
      setLoading(true);
      try {
        const [usersData, rolesData] = await Promise.all([
          RolesPermissionsService.fetchUsers(),
          RolesPermissionsService.fetchRoles(),
        ]);
        setUsers(usersData);
        setRoles(rolesData);
        setError("");
      } catch (err) {
        setError("خطا در دریافت داده‌ها");
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndRoles();
  }, []);

  const handleAssignRole = async (userId) => {
    if (!selectedRole) {
      setError("لطفاً یک نقش انتخاب کنید");
      return;
    }
    try {
      await RolesPermissionsService.assignRoleToUser(userId, selectedRole);
      const updatedUsers = await RolesPermissionsService.fetchUsers();
      setUsers(updatedUsers);
      setSelectedRole("");
      setSelectedUser(null);
      setError("");
    } catch {
      setError("خطا در تخصیص نقش به کاربر");
    }
  };

  const handleRemoveRole = async (userId, roleId) => {
    if (!window.confirm("آیا از حذف این نقش اطمینان دارید؟")) return;
    try {
      await RolesPermissionsService.removeRoleFromUser(userId, roleId);
      const updatedUsers = await RolesPermissionsService.fetchUsers();
      setUsers(updatedUsers);
      setError("");
    } catch {
      setError("خطا در حذف نقش از کاربر");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom>
        مدیریت نقش‌های کاربران
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ boxShadow: 3, marginBottom: 4 }}>
        <Table>
          <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableRow>
              <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                نام کاربر
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                نقش‌ها
              </TableCell>
              <TableCell sx={{ color: theme.palette.primary.contrastText }}>
                عملیات
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.UserID}>
                <TableCell>{`${user.FirstName || "نام"} ${
                  user.LastName || "نام خانوادگی"
                }`}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {user.Roles && user.Roles.length > 0 ? (
                      user.Roles.map((role) => (
                        <Box
                          key={role.RoleID}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            backgroundColor: theme.palette.info.dark,
                            color: theme.palette.info.contrastText,
                            padding: "4px 8px",
                            borderRadius: 1,
                          }}
                        >
                          {role.RoleName}
                          <Button
                            size="small"
                            color="error"
                            onClick={() =>
                              handleRemoveRole(user.UserID, role.RoleID)
                            }
                          >
                            حذف
                          </Button>
                        </Box>
                      ))
                    ) : (
                      <Typography color="textSecondary">بدون نقش</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  {selectedUser === user.UserID ? (
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        displayEmpty
                        fullWidth
                        sx={{ backgroundColor: theme.palette.background.paper }}
                      >
                        <MenuItem value="" disabled>
                          انتخاب نقش
                        </MenuItem>
                        {roles.map((role) => (
                          <MenuItem key={role.RoleID} value={role.RoleID}>
                            {role.RoleName}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleAssignRole(user.UserID)}
                      >
                        افزودن
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        onClick={() => setSelectedUser(null)}
                      >
                        لغو
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setSelectedUser(user.UserID)}
                    >
                      تخصیص نقش
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserRoleManager;
