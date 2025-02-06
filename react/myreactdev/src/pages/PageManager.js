import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import PagesService from "services/PagesService";
import AdvancedTable from "components/tables/AdvancedTable";

const PageManager = () => {
  const theme = useTheme();

  // لیست صفحات، نقش‌ها و مجوزها
  const [pages, setPages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);

  // فرم ایجاد صفحه جدید
  const [newPage, setNewPage] = useState({ PageName: "", PageURL: "" });

  // مدیریت خطاها
  const [error, setError] = useState("");

  // کنترل رفرش پیشرفته جدول
  const [refreshKey, setRefreshKey] = useState(0);

  // -----------------------------------------------------
  // مودال ویرایش صفحه
  // -----------------------------------------------------
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [editFormValues, setEditFormValues] = useState({
    PageName: "",
    PageURL: "",
  });

  // -----------------------------------------------------
  // مودال تخصیص نقش/مجوز
  // -----------------------------------------------------
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignType, setAssignType] = useState(""); // "role" یا "permission"
  const [assignPageID, setAssignPageID] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedPermission, setSelectedPermission] = useState("");

  // بارگیری اولیه نقش‌ها و مجوزها
  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const data = await PagesService.fetchRoles();
      setRoles(data);
    } catch (err) {
      setError("خطا در دریافت نقش‌ها.");
    }
  };

  const fetchPermissions = async () => {
    try {
      const data = await PagesService.fetchPermissions();
      setPermissions(data);
    } catch (err) {
      setError("خطا در دریافت مجوزها.");
    }
  };

  // -----------------------------------------------------
  // تابع fetchData مخصوص AdvancedTable
  // این تابع داده‌های Pages را از سرور می‌خواند و
  // ستون Actions را با دکمه‌های مورد نیاز پر می‌کند.
  // -----------------------------------------------------
  const fetchPages = async () => {
    try {
      const data = await PagesService.fetchPages();
      return data.map((page) => ({
        PageID: page.PageID,
        PageName: page.PageName,
        PageURL: page.PageURL,
        Roles: page.Roles || "نقشی تخصیص داده نشده",
        Permissions: page.Permissions || "مجوزی تخصیص داده نشده",
        // Actions یک المان JSX است که AdvancedTable به شکل متن یا المان نمایش می‌دهد.
        Actions: (
          <>
            <Button
              variant="outlined"
              color="primary"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => openEditModal(page)}
            >
              ویرایش
            </Button>
            <Button
              variant="outlined"
              color="error"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => handleDeletePage(page.PageID)}
            >
              حذف
            </Button>
            <Button
              variant="contained"
              color="secondary"
              sx={{ mr: 1, mb: 1 }}
              onClick={() => openAssignModal(page.PageID, "role")}
            >
              تخصیص نقش
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => openAssignModal(page.PageID, "permission")}
            >
              تخصیص مجوز
            </Button>
          </>
        ),
      }));
    } catch (err) {
      setError("خطا در دریافت صفحات.");
      return [];
    }
  };

  // ستون‌های AdvancedTable
  const columns = [
    { field: "PageID", label: "شناسه" },
    { field: "PageName", label: "نام صفحه" },
    { field: "PageURL", label: "آدرس صفحه" },
    { field: "Roles", label: "نقش‌ها" },
    { field: "Permissions", label: "مجوزها" },
    { field: "Actions", label: "عملیات" },
  ];

  // -----------------------------------------------------
  // افزودن صفحه جدید
  // -----------------------------------------------------
  const handleAddPage = async () => {
    if (!newPage.PageName || !newPage.PageURL) {
      setError("نام و URL صفحه نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await PagesService.addPage(newPage);
      setNewPage({ PageName: "", PageURL: "" });
      setRefreshKey((prev) => prev + 1); // رفرش جدول
    } catch (err) {
      setError(err?.message || "خطا در افزودن صفحه.");
    }
  };

  // -----------------------------------------------------
  // حذف صفحه
  // -----------------------------------------------------
  const handleDeletePage = async (pageId) => {
    if (!window.confirm("آیا از حذف این صفحه اطمینان دارید؟")) return;
    try {
      await PagesService.deletePage(pageId);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError("خطا در حذف صفحه.");
    }
  };

  // -----------------------------------------------------
  // بازکردن مودال ویرایش
  // -----------------------------------------------------
  const openEditModal = (page) => {
    setEditingPage(page);
    setEditFormValues({ PageName: page.PageName, PageURL: page.PageURL });
    setEditModalOpen(true);
  };

  // ویرایش صفحه (ذخیره در مودال)
  const handleEditPage = async () => {
    if (!editFormValues.PageName || !editFormValues.PageURL) {
      setError("نام و URL صفحه نمی‌تواند خالی باشد.");
      return;
    }
    try {
      await PagesService.editPage(editingPage.PageID, editFormValues);
      setEditModalOpen(false);
      setEditingPage(null);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError("خطا در ویرایش صفحه.");
    }
  };

  // -----------------------------------------------------
  // بازکردن مودال تخصیص نقش/مجوز
  // -----------------------------------------------------
  const openAssignModal = (pageId, type) => {
    setAssignPageID(pageId);
    setAssignType(type); // "role" یا "permission"
    setAssignModalOpen(true);
  };

  // تخصیص نقش/مجوز
  const handleAssign = async () => {
    try {
      if (assignType === "role") {
        await PagesService.assignRoleToPage(assignPageID, selectedRole);
      } else {
        await PagesService.assignPermissionToPage(
          assignPageID,
          selectedPermission
        );
      }
      setAssignModalOpen(false);
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      setError(
        assignType === "role"
          ? "خطا در تخصیص نقش به صفحه."
          : "خطا در تخصیص مجوز به صفحه."
      );
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        مدیریت صفحات
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* فرم افزودن صفحه جدید */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <TextField
          label="نام صفحه"
          value={newPage.PageName}
          onChange={(e) => setNewPage({ ...newPage, PageName: e.target.value })}
        />
        <TextField
          label="آدرس صفحه"
          value={newPage.PageURL}
          onChange={(e) => setNewPage({ ...newPage, PageURL: e.target.value })}
        />
        <Button variant="contained" onClick={handleAddPage}>
          افزودن صفحه
        </Button>
      </Box>

      {/* AdvancedTable برای نمایش لیست صفحات */}
      <AdvancedTable
        key={refreshKey} // تغییر این مقدار باعث re-mount شدن و صدازدن مجدد fetchData می‌شود
        columns={columns}
        fetchData={fetchPages}
        defaultPageSize={10}
        // showSearchTerm={false}
        showColumnsFilter={false}
        showStatusFilter={false}
        // showDownload={false}
      />

      {/* مودال ویرایش صفحه */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            ویرایش صفحه
          </Typography>
          <TextField
            label="نام صفحه"
            fullWidth
            sx={{ mb: 2 }}
            value={editFormValues.PageName}
            onChange={(e) =>
              setEditFormValues({ ...editFormValues, PageName: e.target.value })
            }
          />
          <TextField
            label="آدرس صفحه"
            fullWidth
            value={editFormValues.PageURL}
            onChange={(e) =>
              setEditFormValues({ ...editFormValues, PageURL: e.target.value })
            }
          />
          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleEditPage}>
              ذخیره
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ ml: 1 }}
              onClick={() => setEditModalOpen(false)}
            >
              بستن
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* مودال تخصیص نقش/مجوز */}
      <Modal open={assignModalOpen} onClose={() => setAssignModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {assignType === "role" ? "تخصیص نقش" : "تخصیص مجوز"}
          </Typography>
          {assignType === "role" ? (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>انتخاب نقش</InputLabel>
              <Select
                label="انتخاب نقش"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <MenuItem key={role.RoleID} value={role.RoleID}>
                    {role.RoleName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>انتخاب مجوز</InputLabel>
              <Select
                label="انتخاب مجوز"
                value={selectedPermission}
                onChange={(e) => setSelectedPermission(e.target.value)}
              >
                {permissions.map((perm) => (
                  <MenuItem key={perm.PermissionID} value={perm.PermissionID}>
                    {perm.PermissionName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" onClick={handleAssign}>
              ذخیره
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ ml: 1 }}
              onClick={() => setAssignModalOpen(false)}
            >
              بستن
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PageManager;
