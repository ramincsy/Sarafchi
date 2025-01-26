// src/utils/userUtils.js
import { jwtDecode } from "jwt-decode"; // اصلاح مسیر برای اطمینان از صحت
import { tokenManager } from "utils/tokenManager"; // فرض می‌کنیم tokenManager در همین مسیر قرار دارد

/**
 * استخراج user_id از توکن
 * @param {string} token - توکن دسترسی
 * @returns {string|null} - user_id یا null در صورت خطا
 */
const extractUserIDFromToken = (token) => {
  try {
    const decoded = jwtDecode(token); // دیکود کردن توکن
    if (decoded && decoded.sub) {
      return decoded.sub; // فرض: decoded.sub حاوی user_id است
    }
    throw new Error("Invalid token structure: 'sub' field is missing.");
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

/**
 * ذخیره اطلاعات کاربر در localStorage
 * @param {Object} userInfo - اطلاعات کاربر شامل user_id
 */
const saveUserToLocalStorage = (userInfo) => {
  try {
    localStorage.setItem("user_info", JSON.stringify(userInfo));
    console.log("User information saved to localStorage successfully.");
  } catch (error) {
    console.error("Error saving user information to localStorage:", error);
  }
};

/**
 * دریافت اطلاعات کاربر از localStorage
 * @returns {Object|null} - اطلاعات کاربر یا null در صورت عدم وجود
 */
const getUserFromLocalStorage = () => {
  try {
    const userInfo = JSON.parse(localStorage.getItem("user_info"));
    return userInfo || null;
  } catch (error) {
    console.error("Error reading user information from localStorage:", error);
    return null;
  }
};

/**
 * دریافت user_id از contextUserInfo، localStorage یا توکن
 * @param {Object|null} contextUserInfo - اطلاعات کاربر از کانتکست
 * @returns {string|null} - user_id یا null در صورت خطا
 */
export const getUserID = (contextUserInfo = null) => {
  try {
    // اگر contextUserInfo وجود داشته باشد و شامل user_id باشد، آن را برگردان
    if (contextUserInfo?.UserID) {
      return contextUserInfo.UserID; // فقط مقدار UserID بازگردانده شود
    }

    // تلاش برای دریافت اطلاعات از localStorage
    const localUserInfo = getUserFromLocalStorage();
    if (localUserInfo?.UserID) {
      return localUserInfo.UserID; // فقط مقدار UserID بازگردانده شود
    }

    // استخراج user_id از توکن در صورت نبودن در localStorage
    const token = tokenManager.getAccessToken();
    if (token) {
      const user_id = extractUserIDFromToken(token);
      if (user_id) {
        // ذخیره اطلاعات کاربر در localStorage برای استفاده‌های آینده
        saveUserToLocalStorage({ UserID: user_id }); // ذخیره فقط UserID
        return user_id;
      }
    }

    // در صورت عدم موفقیت در تمام روش‌ها
    return null;
  } catch (error) {
    console.error("Error reading user_id:", error);
    return null;
  }
};
