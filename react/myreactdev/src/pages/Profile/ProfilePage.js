import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Divider,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import {
  Email,
  Phone,
  AccountCircle,
  Person,
  Pages as PagesIcon,
} from "@mui/icons-material";

import UserService from "services/UserService";
import AuthContext from "contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

const getTokenExpiryTime = (token) => {
  const decoded = decodeToken(token);
  if (decoded && decoded.exp) {
    return decoded.exp * 1000; // تبدیل به میلی‌ثانیه
  }
  return null;
};

const getRemainingTime = (expiryTime) => {
  if (!expiryTime) return null;
  const now = Date.now();
  return expiryTime > now ? expiryTime - now : 0;
};

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo, authToken, refreshToken } = useContext(AuthContext);
  const userID = userInfo?.UserID;

  const [loginTime, setLoginTime] = useState(null);
  const [tokenExpiry, setTokenExpiry] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);

  const handleLogout = async () => {
    try {
      const response = await UserService.logout(); // ارسال درخواست لاگ‌اوت

      if (response.clear_local_storage) {
        // localStorage.clear(); // پاک کردن لوکال استوریج
      }

      window.location.href = "/login"; // هدایت به صفحه ورود
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const expiryTime = getTokenExpiryTime(authToken);
    setTokenExpiry(expiryTime);
    const loginTimestamp = userInfo?.loginTime || Date.now();
    setLoginTime(loginTimestamp);
    // محاسبه زمان باقی‌مانده
    const interval = setInterval(() => {
      const remaining = getRemainingTime(expiryTime);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(interval); // پاک کردن تایمر
  }, [authToken, userInfo]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userID) {
        console.error("User ID not found");
        return;
      }

      try {
        const data = await UserService.getUserDetails(userID);
        setUser({
          name: `${data.FirstName} ${data.LastName}`,
          email: data.Email,
          phone: data.PhoneNumber,
          wallet: data.WalletAddress,
          createdBy: data.CreatedBy,
          nationalID: data.NationalID,
          dateCreated: new Date(data.DateCreated).toLocaleDateString("fa-IR"),
        });
        setRoles(data.Roles || []);
        setPermissions(data.Permissions || []);
        setPages(data.Pages || []);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <Typography>در حال بارگذاری...</Typography>;
  }

  if (!user) {
    return <Typography>اطلاعات کاربر یافت نشد.</Typography>;
  }

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "auto",
        padding: "16px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
        }}
      >
        <Avatar
          alt={user.name}
          src="https://via.placeholder.com/150"
          sx={{ width: 120, height: 120, marginBottom: 2 }}
        />
        <Typography variant="h5" fontWeight="bold">
          {user.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          تاریخ ثبت‌نام: {user.dateCreated}
        </Typography>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        <Grid container spacing={2} sx={{ width: "100%" }}>
          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Email color="primary" />
              <Box>
                <Typography variant="subtitle1">ایمیل</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.email}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Phone color="primary" />
              <Box>
                <Typography variant="subtitle1">شماره تماس</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.phone}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccountCircle color="primary" />
              <Box>
                <Typography variant="subtitle1">کد ملی</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.nationalID}
                </Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Person color="primary" />
              <Box>
                <Typography variant="subtitle1">ایجاد شده توسط</Typography>
                <Typography variant="body2" color="textSecondary">
                  {user.createdBy}
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        <Typography variant="h5" fontWeight="bold">
          {user.name}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          تاریخ ثبت‌نام: {user.dateCreated}
        </Typography>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        <Typography variant="h6" gutterBottom>
          اطلاعات توکن
        </Typography>
        <Stack spacing={1} sx={{ width: "100%" }}>
          <Typography>
            <strong>زمان ورود:</strong>{" "}
            {new Date(loginTime).toLocaleTimeString("fa-IR")}
          </Typography>
          <Typography>
            <strong>زمان انقضا توکن:</strong>{" "}
            {tokenExpiry
              ? new Date(tokenExpiry).toLocaleTimeString("fa-IR")
              : "نامشخص"}
          </Typography>
          <Typography>
            <strong>زمان باقی‌مانده:</strong>{" "}
            {remainingTime
              ? `${Math.floor(remainingTime / 1000)} ثانیه`
              : "منقضی شده"}
          </Typography>
        </Stack>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        {/* سایر بخش‌ها */}
        <Typography variant="h6" gutterBottom></Typography>
        <Typography variant="h6" gutterBottom>
          نقش‌ها
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {roles.map((role, index) => (
            <Chip key={index} label={role} color="primary" />
          ))}
        </Stack>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        <Typography variant="h6" gutterBottom>
          مجوزها
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {permissions.map((permission, index) => (
            <Chip key={index} label={permission} color="secondary" />
          ))}
        </Stack>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        <Typography variant="h6" gutterBottom>
          صفحات قابل مشاهده
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {pages.map((page, index) => (
            <Chip key={index} label={page} variant="outlined" />
          ))}
        </Stack>
        <Divider sx={{ width: "100%", marginY: 2 }} />
        <Box display="flex" justifyContent="center" gap={2}>
          <Button variant="contained" color="primary">
            ویرایش پروفایل
          </Button>
          <Button onClick={handleLogout} variant="outlined" color="error">
            خروج از حساب
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfilePage;
