import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom"; // برای هدایت
import { tokenManager } from "utils/tokenManager";
import { jwtDecode } from "jwt-decode";
import AuthService from "services/AuthService";
import LoginPage from "pages/Auth/LoginPage"; // صفحه لاگین

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(tokenManager.getAccessToken());
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate(); // برای هدایت به صفحه لاگین

  /**
   * دیکد و تنظیم اطلاعات کاربر از توکن
   */
  const decodeAndSetUserInfo = useCallback((token) => {
    try {
      const decoded = jwtDecode(token);
      //console.log("Decoded token payload:", decoded);

      if (!decoded || !decoded.sub) {
        throw new Error("Invalid token structure");
      }

      setUserInfo(decoded.sub);
      console.log("User info set successfully.");
    } catch (error) {
      console.error("Error decoding token:", error);
      tokenManager.clearTokens();
    }
  }, []);

  /**
   * فرآیند ورود کاربر
   */
  const login = async (email, password, ipAddress, deviceId) => {
    try {
      console.log("Attempting to login...");
      const response = await AuthService.login(
        email,
        password,
        ipAddress,
        deviceId
      );

      const {
        access_token,
        refresh_token,
        access_token_expiry,
        refresh_token_expiry,
      } = response.data;

      if (!access_token || !refresh_token) {
        throw new Error("Invalid tokens received from server.");
      }
      if (
        !access_token_expiry ||
        isNaN(new Date(access_token_expiry).getTime())
      ) {
        console.error(
          "Error: Missing or invalid access_token_expiry in server response."
        );

        // بررسی مقدار در localStorage
        const localExpiry = localStorage.getItem("access_token_expiry");
        if (localExpiry) {
          console.warn(
            "Using access_token_expiry from localStorage:",
            localExpiry
          );
        } else {
          throw new Error(
            "Invalid or missing access_token_expiry in both server response and localStorage."
          );
        }
      }

      // بررسی زمان انقضا پیش از ذخیره

      // ذخیره توکن‌ها
      tokenManager.setTokens({
        access_token,
        refresh_token,
        access_token_expiry,
        refresh_token_expiry,
      });

      setAuthToken(access_token);
      decodeAndSetUserInfo(access_token);
      console.log("Login successful.");
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  /**
   * تمدید توکن کاربر
   */
  /**
   * تمدید توکن کاربر
   */
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = tokenManager.getAccessToken();

      // اعتبارسنجی توکن فعلی
      if (currentToken && tokenManager.isTokenValid(currentToken)) {
        if (!tokenManager.isTokenNearExpiry()) {
          console.log("Token is valid and not near expiry. No refresh needed.");
          return;
        }
      } else {
        console.warn("Token is invalid or expired. Proceeding to refresh...");
      }

      // تمدید توکن
      const newAccessToken = await tokenManager.refreshAccessToken();
      setAuthToken(newAccessToken);
      decodeAndSetUserInfo(newAccessToken);

      console.log("Token successfully refreshed.");
    } catch (error) {
      console.error("Error refreshing token:", error);
      tokenManager.clearTokens();
      setAuthToken(null);
      setUserInfo(null);

      if (window.location.pathname !== "/login") {
        navigate("/login"); // هدایت به صفحه لاگین
      }
    }
  }, [decodeAndSetUserInfo, navigate]);

  /**
   * مقداردهی اولیه احراز هویت
   */
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        const token = tokenManager.getAccessToken();

        if (!token) {
          console.log("No token found. Redirecting to login...");
          tokenManager.clearTokens();
          setAuthToken(null);
          setUserInfo(null);
          navigate("/login"); // هدایت به صفحه لاگین
          return;
        }

        if (tokenManager.isTokenValid(token)) {
          setAuthToken(token);
          decodeAndSetUserInfo(token);
        } else {
          console.warn(
            "Access token is invalid or expired. Clearing session..."
          );
          tokenManager.clearTokens();
          setAuthToken(null);
          setUserInfo(null);
          navigate("/login"); // هدایت به صفحه لاگین
        }
      } catch (error) {
        console.error("Error during authentication initialization:", error);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [decodeAndSetUserInfo, navigate]);

  return (
    <AuthContext.Provider
      value={{
        authToken,
        userInfo,
        refreshToken,
        login,
        logout: () => {
          console.log("Logging out...");
          tokenManager.clearTokens();
          setAuthToken(null);
          setUserInfo(null);
          navigate("/login"); // هدایت به صفحه لاگین
        },
      }}
    >
      {isLoading ? (
        <div>در حال بارگذاری اطلاعات کاربر...</div>
      ) : !authToken || !userInfo ? (
        <LoginPage /> // نمایش مستقیم صفحه لاگین
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export default AuthContext;
