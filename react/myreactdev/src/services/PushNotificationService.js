import axiosInstance from "utils/axiosInstance";

class CustomError extends Error {
  constructor(message, details) {
    super(message);
    this.details = details;
  }
}

const PushNotificationService = {
  // دریافت نوتیفیکیشن‌ها
  fetchNotifications: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/push/notifications?user_id=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw new CustomError(
        "Failed to fetch notifications",
        error.response?.data || error.message
      );
    }
  },

  // ارسال نوتیفیکیشن
  sendPushNotification: async (notification) => {
    try {
      const response = await axiosInstance.post(`/push/send`, notification);
      console.log("Sent payload:", notification);
      console.log("Server response:", response);
      return response.data;
    } catch (error) {
      console.error("Error sending push notification:", error);
      throw new CustomError(
        "Failed to send push notification",
        error.response?.data || error.message
      );
    }
  },

  // حذف نوتیفیکیشن
  deleteNotification: async (notificationId, userId) => {
    try {
      const response = await axiosInstance.post(`/push/delete`, {
        notification_id: notificationId,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new CustomError(
        "Failed to delete notification",
        error.response?.data || error.message
      );
    }
  },

  // ذخیره توکن Firebase
  saveToken: async (token, userId) => {
    if (!userId || !token) {
      console.error("User ID or Token is missing");
      throw new CustomError(
        "User ID or Token is missing",
        "Please provide valid user ID and token."
      );
    }

    try {
      const response = await axiosInstance.post(`/push/save-token`, {
        token,
        user_id: userId,
      });
      console.log("Token saved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error saving token:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);

        if (error.response.status === 409) {
          throw new CustomError("Token already exists", error.response.data);
        }
      }
      throw new CustomError(
        "Failed to save token",
        error.response?.data || error.message
      );
    }
  },

  // به‌روزرسانی توکن Firebase (در صورت نیاز)
  updateToken: async (userId, oldToken, newToken) => {
    try {
      const response = await axiosInstance.post(`/push/update-token`, {
        user_id: userId,
        old_token: oldToken,
        new_token: newToken,
      });
      console.log("Token updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating token:", error);
      throw new CustomError(
        "Failed to update token",
        error.response?.data || error.message
      );
    }
  },
};

export default PushNotificationService;
