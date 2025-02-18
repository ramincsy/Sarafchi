import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AuthContext from "contexts/AuthContext";
import { getOrCreateUUID } from "utils/uuidManager";
import { getIPAddress } from "utils/ipHelper";
import TwoFactorModal from "./TwoFactorModal";
import "./loginStyles.css";
import logo from "assets/styles/images/logo-login.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [openTwoFactorModal, setOpenTwoFactorModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isFirstAuthCompleted, setIsFirstAuthCompleted] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const needs2FA = localStorage.getItem("needs2FA");
      if (needs2FA === "true") {
        setOpenTwoFactorModal(true);
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("لطفاً قوانین و مقررات را مطالعه و تایید کنید");
      return;
    }

    setIsLoading(true);

    try {
      const deviceId = getOrCreateUUID();
      const ipAddress = await getIPAddress();

      await login(email, password, ipAddress, deviceId);

      // ذخیره وضعیت در localStorage و فعال کردن مودال 2FA
      localStorage.setItem("needs2FA", "true");
      setOpenTwoFactorModal(true);
      setIsFirstAuthCompleted(true);
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

  const handleTwoFactorSubmit = () => {
    if (twoFactorCode.length > 0) {
      localStorage.removeItem("needs2FA");
      navigate("/CartModal");
      // ریست کردن فرم
      setEmail("");
      setPassword("");
      setTwoFactorCode("");
      setOpenTwoFactorModal(false);
    }
  };

  return (
    <div className="glass-container">
      <div className="wave"></div>
      <Container component="main" maxWidth="xs">
        <Paper className="glass-card">
          <Box className="login-header">
            <img src={logo} alt="Logo" className="login-logo" />
          </Box>
          <Box component="form" onSubmit={handleLogin} className="login-form">
            <TextField
              fullWidth
              required
              placeholder="ایمیل"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-textfield"
            />
            <TextField
              fullWidth
              required
              placeholder="پسورد"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-textfield"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="login-checkbox"
                />
              }
              label={
                <Typography component="span" className="login-terms-label">
                  {"قوانین و مقررات سایت را "}
                  <RouterLink to="/terms" className="login-terms-link">
                    مطالعه کردم
                  </RouterLink>
                  {" می‌پذیرم"}
                </Typography>
              }
              className="login-terms-control"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox"
                />
              }
              label={
                <Typography className="login-remember-label">
                  مرا به خاطر بسپار
                </Typography>
              }
              className="login-remember-control"
            />
            {error && (
              <Alert severity="error" className="login-error-alert">
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || !acceptedTerms}
              className="login-button"
            >
              {isLoading ? (
                <CircularProgress size={24} className="login-button-progress" />
              ) : (
                "ورود"
              )}
            </Button>
          </Box>
        </Paper>
      </Container>
      <TwoFactorModal
        open={openTwoFactorModal}
        twoFactorCode={twoFactorCode}
        setTwoFactorCode={setTwoFactorCode}
        onSubmit={handleTwoFactorSubmit}
        onClose={() => setOpenTwoFactorModal(false)}
      />
    </div>
  );
};

export default LoginPage;
