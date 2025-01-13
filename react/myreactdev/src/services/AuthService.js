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
};

export default AuthService;
