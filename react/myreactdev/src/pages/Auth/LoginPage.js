import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import AuthContext from "contexts/AuthContext";
import { getOrCreateUUID } from "utils/uuidManager"; // استفاده از تابع مرکزی
import { getIPAddress } from "utils/ipHelper"; // فایل کمکی برای دریافت IP
import Avatar from "@mui/material/Avatar";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // استفاده از متد login از AuthContext

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const deviceId = getOrCreateUUID();
      const ipAddress = await getIPAddress();

      await login(email, password, ipAddress, deviceId); // استفاده از متد login از AuthContext

      console.log("Login successful. Navigating to dashboard...");
      navigate("/adminDashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "مشکلی در ورود رخ داده است. لطفاً دوباره تلاش کنید."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            ورود
          </Typography>
        </Box>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="ایمیل"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="رمز عبور"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "ورود"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default LoginPage;
