import axios from "axios";
import { tokenManager } from "utils/tokenManager";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let refreshQueue = [];

const enqueueRefreshRequest = () => {
  return new Promise((resolve, reject) => {
    refreshQueue.push({ resolve, reject });
  });
};

const processRefreshQueue = (error, token = null) => {
  refreshQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  refreshQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config) => {
    // استثناء برای درخواست لاگین
    if (config.url === "/login") return config;

    try {
      const validToken = tokenManager.getAccessToken();

      // بررسی وضعیت توکن
      if (validToken && tokenManager.isTokenValid(validToken)) {
        // اگر توکن معتبر است اما نزدیک به انقضا است
        if (tokenManager.isTokenNearExpiry()) {
          if (!isRefreshing) {
            isRefreshing = true;

            try {
              const newToken = await tokenManager.refreshAccessToken();
              processRefreshQueue(null, newToken);
              config.headers.Authorization = `Bearer ${newToken}`;
            } catch (error) {
              processRefreshQueue(error, null);
              throw error;
            } finally {
              isRefreshing = false;
            }
          } else {
            const tokenFromQueue = await enqueueRefreshRequest();
            config.headers.Authorization = `Bearer ${tokenFromQueue}`;
          }
        } else {
          // اگر توکن معتبر و زمان کافی دارد
          config.headers.Authorization = `Bearer ${validToken}`;
        }
      } else {
        console.warn("توکن نامعتبر است یا یافت نشد.");
        tokenManager.clearTokens();
        throw new Error("توکن نامعتبر است. کاربر باید وارد شود.");
      }
    } catch (error) {
      console.error("خطا در اعتبارسنجی یا تمدید توکن:", error);
      throw error;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("خطای 401 دریافت شد. ممکن است توکن منقضی شده باشد.");
      tokenManager.clearTokens();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
