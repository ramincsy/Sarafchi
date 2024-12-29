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
} from "@mui/material";
import RolesPermissionsService from "services/RolesPermissionsService";

const PermissionManagement = () => {
  const [permissions, setPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await RolesPermissionsService.fetchPermissions();
        setPermissions(data);
      } catch (err) {
        setError("خطا در دریافت مجوزها.");
      }
    };

    fetchPermissions();
  }, []);

  const handleAddPermission = async () => {
    if (!newPermission) {
      setError("نام مجوز نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await RolesPermissionsService.addPermission(
        newPermission,
        "توضیحات دلخواه"
      );
      setNewPermission("");
      setPermissions([
        ...permissions,
        { PermissionID: permissions.length + 1, PermissionName: newPermission },
      ]);
    } catch (err) {
      setError("خطا در افزودن مجوز.");
    }
  };

  const handleDeletePermission = async (permissionId) => {
    if (!window.confirm("آیا از حذف این مجوز اطمینان دارید؟")) return;

    try {
      await RolesPermissionsService.deletePermission(permissionId);
      setPermissions(
        permissions.filter(
          (permission) => permission.PermissionID !== permissionId
        )
      );
    } catch (err) {
      setError("خطا در حذف مجوز.");
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" textAlign="center" gutterBottom>
        مدیریت مجوزها
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
            value={newPermission}
            onChange={(e) => setNewPermission(e.target.value)}
            placeholder="نام مجوز جدید"
            label="نام مجوز جدید"
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleAddPermission}
          >
            افزودن مجوز
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>شناسه مجوز</TableCell>
              <TableCell>نام مجوز</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.PermissionID}>
                <TableCell>{permission.PermissionID}</TableCell>
                <TableCell>{permission.PermissionName}</TableCell>
                <TableCell align="center">
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() =>
                      handleDeletePermission(permission.PermissionID)
                    }
                  >
                    حذف
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

export default PermissionManagement;
