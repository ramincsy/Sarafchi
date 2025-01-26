import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Modal,
  TextField,
  Grid,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AuthContext from "contexts/AuthContext";
import UserService from "services/UserService";
import WalletService from "services/WalletService";

export default function ManageUsers() {
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const id = userInfo.UserID;

  const [inputs, setInputs] = useState({
    firstName: "",
    lastName: "",
    nationalID: "",
    phoneNumber: "",
    email: "",
    password: "",
    walletAddress: "",
  });
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      console.log(userInfo);
      const data = await UserService.fetchUsers();
      setUsers(data);
    } catch (error) {
      alert(`خطا در دریافت لیست کاربران: ${error}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // آماده‌سازی payload کاربر
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
        // ویرایش کاربر موجود
        await UserService.updateUser(editingUser.ID, userPayload);
        alert("کاربر با موفقیت ویرایش شد");
      } else {
        // ایجاد کاربر جدید
        const response = await UserService.createUser(userPayload);

        if (response) {
          const { userID, walletAddress } = response; // ساختار response.data مستقیم مدیریت می‌شود
          alert(
            `کاربر با موفقیت ایجاد شد! \n شناسه: ${
              userID || "نامشخص"
            } \n آدرس کیف پول: ${walletAddress || "نامشخص"}`
          );
        }
      }

      // پاک کردن فرم و بستن مدال
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
      fetchUsers();
      setModalOpen(false);
    } catch (error) {
      // مدیریت خطا و نمایش پیام
      console.error("Error in handleSubmit:", error);
      const errorMessage =
        error.message || "خطای نامشخص در ذخیره کاربر. لطفاً دوباره تلاش کنید.";
      alert(`خطا در ذخیره کاربر: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید این کاربر را حذف کنید؟")) {
      try {
        await UserService.deleteUser(id);
        alert("کاربر با موفقیت حذف شد");
        fetchUsers();
      } catch (error) {
        console.log(error);
        alert(`خطا در حذف کاربر: ${error}`);
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setInputs({
      firstName: user.FirstName,
      lastName: user.LastName,
      nationalID: user.NationalID,
      phoneNumber: user.PhoneNumber,
      email: user.Email,
      password: "",
      walletAddress: user.WalletAddress,
    });
    setModalOpen(true);
  };

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
      <TableContainer component={Paper} sx={{ marginTop: 3 }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>نام</TableCell>
              <TableCell>نام خانوادگی</TableCell>
              <TableCell>ایمیل</TableCell>
              <TableCell>شماره تلفن</TableCell>
              <TableCell>کد ملی</TableCell>
              <TableCell align="center">عملیات</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.ID}>
                <TableCell>{user.FirstName}</TableCell>
                <TableCell>{user.LastName}</TableCell>
                <TableCell>{user.Email}</TableCell>
                <TableCell>{user.PhoneNumber}</TableCell>
                <TableCell>{user.NationalID}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEdit(user)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.ID)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
                required={!editingUser}
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
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", marginTop: 2 }}
          >
            <Button type="submit" variant="contained" color="primary">
              {editingUser ? "ذخیره تغییرات" : "ایجاد کاربر"}
            </Button>
            <Button
              onClick={() => setModalOpen(false)}
              variant="outlined"
              color="secondary"
              sx={{ marginLeft: 1 }}
            >
              بستن
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
