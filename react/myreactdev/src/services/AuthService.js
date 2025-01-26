import axiosInstance from "utils/axiosInstance";
import { getIPAddress } from "utils/ipHelper";
import { getOrCreateUUID } from "utils/uuidManager";

const AuthService = {
  login: async (email, password) => {
    const deviceId = getOrCreateUUID(); // دریافت یا ایجاد UUID
    const ipAddress = await getIPAddress(); // دریافت IP آدرس
    console.log("Sending to server:", {
      email,
      password,
      ip_address: ipAddress,
      device_id: deviceId, // ارسال UUID صحیح
    });

    return axiosInstance.post("/login", {
      email,
      password,
      ip_address: ipAddress,
      device_id: deviceId,
    });
  },

  refreshAccessToken: async (refreshToken) => {
    const deviceId = getOrCreateUUID(); // دریافت یا ایجاد UUID
    const ipAddress = await getIPAddress(); // دریافت IP آدرس
    console.log("Refreshing token with:", {
      refresh_token: refreshToken,
      device_id: deviceId, // ارسال UUID صحیح
      ip_address: ipAddress,
    });

    const response = await axiosInstance.post("/refresh", {
      refresh_token: refreshToken,
      device_id: deviceId,
      ip_address: ipAddress,
    });

    if (!response.data.access_token || !response.data.access_token_expiry) {
      throw new Error("Invalid response from refresh endpoint.");
    }

    return response.data;
  },
  logout: async () => {
    const deviceId = getOrCreateUUID(); // دریافت یا ایجاد UUID
    const ipAddress = await getIPAddress(); // دریافت IP آدرس

    // دریافت user_info از localStorage
    const user_info = JSON.parse(localStorage.getItem("user_info"));

    // بررسی وجود user_info
    if (!user_info || !user_info.UserID) {
      console.error("User info or UserID not found in localStorage");
      throw new Error("User info is required");
    }

    const user_id = user_info.UserID.UserID; // استخراج UserID از user_info
    console.log("User ID ok:", user_id);

    console.log("Logging out with:", {
      user_id: user_id,
      device_id: deviceId,
      ip_address: ipAddress,
    });

    return axiosInstance.post("/logout", {
      user_id: user_id, // ارسال user_id به سرور (فقط مقدار UserID)
      device_id: deviceId,
      ip_address: ipAddress,
    });
  },
};

export default AuthService;
