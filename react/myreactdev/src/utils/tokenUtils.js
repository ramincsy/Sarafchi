// utils/tokenUtils.js
import { jwtDecode } from "jwt-decode";

export const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const expiry = decoded.exp * 1000; // زمان انقضا در میلی‌ثانیه
    console.log(
      `Token expiry: ${new Date(expiry)}, Current time: ${new Date()}`
    );
    return expiry < Date.now();
  } catch (error) {
    console.error("Error decoding token:", error);
    return true; // اگر توکن معتبر نباشد، منقضی در نظر گرفته می‌شود
  }
};
