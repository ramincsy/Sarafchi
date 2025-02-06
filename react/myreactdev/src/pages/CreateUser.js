import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  Grid,
  useTheme,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

import AuthContext from "contexts/AuthContext";
import UserService from "services/UserService";
import AdvancedTable from "components/tables/AdvancedTable";

export default function ManageUsers() {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);

  // استیت‌های مربوط به فرم (برای ایجاد/ویرایش کاربر)
  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    nationalID: "",
    phoneNumber: "",
    email: "",
    password: "",
    walletAddress: "",
  });

  // اگر این مقدار null باشد، در حالت «ایجاد کاربر» هستیم؛ اگر object باشد، در حال «ویرایش کاربر» هستیم
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // برای رفرش مجدد جدول پس از ایجاد/ویرایش/حذف
  const [refreshKey, setRefreshKey] = useState(0);

  // تابع تغییر مقدار فیلدهای فرم
  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  // تابع ارسال فرم (ایجاد یا ویرایش کاربر)
  const handleSubmit = async (event) => {
    event.preventDefault();

    // ساختار داده ارسالی به سرور
    const userPayload = {
      FirstName: inputs.firstName,
      LastName: inputs.lastName,
      NationalID: inputs.nationalID,
      PhoneNumber: inputs.phoneNumber,
      Email: inputs.email,
      Password: inputs.password,
      CreatedBy: userInfo?.name || "Admin",
    };

    try {
      if (editingUser) {
        // ویرایش کاربر
        await UserService.updateUser(editingUser.ID, userPayload);
        alert("کاربر با موفقیت ویرایش شد");
      } else {
        // ایجاد کاربر جدید
        const response = await UserService.createUser(userPayload);
        if (response) {
          const { userID, walletAddress } = response;
          alert(`کاربر با موفقیت ایجاد شد!
شناسه: ${userID || "نامشخص"}
آدرس کیف پول: ${walletAddress || "نامشخص"}`);
        }
      }

      // پاک کردن فرم
      setInputs({
        firstName: "",
        lastName: "",
        nationalID: "",
        phoneNumber: "",
        email: "",
        password: "",
        walletAddress: "",
      });
      setEditingUser(null);
      setModalOpen(false);
      // رفرش جدول
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert(
        `خطا در ذخیره کاربر: ${
          error.message || "خطای نامشخص، لطفاً دوباره تلاش کنید."
        }`
      );
    }
  };

  // حذف کاربر
  const handleDelete = async (id) => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟")) {
      try {
        await UserService.deleteUser(id);
        alert("کاربر با موفقیت حذف شد");
        // رفرش جدول
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.log(error);
        alert(`خطا در حذف کاربر: ${error}`);
      }
    }
  };

  // ویرایش کاربر
  const handleEdit = (row) => {
    setEditingUser(row);
    setInputs({
      firstName: row.FirstName,
      lastName: row.LastName,
      nationalID: row.NationalID,
      phoneNumber: row.PhoneNumber,
      email: row.Email,
      password: "",
      walletAddress: row.WalletAddress || "",
    });
    setModalOpen(true);
  };

  // تابع fetchData مخصوص AdvancedTable
  // - اینجا ستون "Actions" را به صورت یک المان React (دکمه‌های ویرایش و حذف) مقداردهی می‌کنیم
  const fetchData = async () => {
    try {
      const data = await UserService.fetchUsers();
      return data.map((user) => ({
        ID: user.ID,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        PhoneNumber: user.PhoneNumber,
        NationalID: user.NationalID,
        WalletAddress: user.WalletAddress,
        // ست کردن یک المان React به عنوان مقدار ستون Actions
        Actions: (
          <>
            <IconButton color="primary" onClick={() => handleEdit(user)}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" onClick={() => handleDelete(user.ID)}>
              <DeleteIcon />
            </IconButton>
          </>
        ),
      }));
    } catch (error) {
      alert(`خطا در دریافت لیست کاربران: ${error}`);
      return [];
    }
  };

  // ستون‌های AdvancedTable
  // توجه کنید که ستون Actions نیز داریم تا مقدار React (دکمه‌های ویرایش و حذف) نمایش داده شود
  const columns = [
    { field: "FirstName", label: "نام" },
    { field: "LastName", label: "نام خانوادگی" },
    { field: "Email", label: "ایمیل" },
    { field: "PhoneNumber", label: "شماره تلفن" },
    { field: "NationalID", label: "کد ملی" },
    { field: "Actions", label: "عملیات" },
  ];

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت کاربران
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => {
          setEditingUser(null);
          setInputs({
            firstName: "",
            lastName: "",
            nationalID: "",
            phoneNumber: "",
            email: "",
            password: "",
            walletAddress: "",
          });
          setModalOpen(true);
        }}
      >
        ایجاد کاربر جدید
      </Button>

      {/* استفاده از AdvancedTable به جای MUI Table */}
      <Box sx={{ marginTop: 3 }}>
        <AdvancedTable
          key={refreshKey} // تغییر در refreshKey باعث re-mount شدن جدول می‌شود
          columns={columns}
          fetchData={fetchData}
          defaultPageSize={10}
        />
      </Box>

      {/* مدال (Modal) برای ایجاد/ویرایش کاربر */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          component="form"
          onSubmit={handleSubmit}
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
          <Typography variant="h6" gutterBottom>
            {editingUser ? "ویرایش کاربر" : "ایجاد کاربر جدید"}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="نام"
                name="firstName"
                value={inputs.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="نام خانوادگی"
                name="lastName"
                value={inputs.lastName}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="کد ملی"
                name="nationalID"
                value={inputs.nationalID}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="شماره تلفن"
                name="phoneNumber"
                value={inputs.phoneNumber}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="ایمیل"
                name="email"
                type="email"
                value={inputs.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="رمز عبور"
                name="password"
                type="password"
                value={inputs.password}
                onChange={handleChange}
                fullWidth
                required={!editingUser} // اگر در حال ویرایش باشیم، رمز عبور اجباری نیست
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="آدرس کیف پول"
                name="walletAddress"
                value={inputs.walletAddress}
                onChange={handleChange}
                fullWidth
                disabled // غیرفعال کردن فیلد برای ویرایش
              />
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              {editingUser ? "ذخیره تغییرات" : "ایجاد کاربر"}
            </Button>
            <Button
              onClick={() => setModalOpen(false)}
              variant="outlined"
              color="secondary"
              sx={{ ml: 1 }}
            >
              بستن
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
