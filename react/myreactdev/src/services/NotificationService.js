import axiosInstance from "utils/axiosInstance";

const NotificationService = {
  // دریافت نوتیفیکیشن‌ها
  fetchNotifications: async (userId) => {
    try {
      const response = await axiosInstance.get(
        `/notifications?user_id=${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  },

  // ارسال نوتیفیکیشن
  sendNotification: async (notification) => {
    try {
      const response = await axiosInstance.post("/notifications/send", {
        user_id: notification.user_id,
        title: notification.title,
        message: notification.message,
        type: notification.type || "general",
      });
      return response.data;
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  },

  // علامت‌گذاری به عنوان خوانده‌شده
  markAsRead: async (notificationIds, userId) => {
    try {
      const response = await axiosInstance.post("/notifications/mark-read", {
        notification_ids: notificationIds,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      throw error;
    }
  },

  // حذف نوتیفیکیشن
  deleteNotification: async (notificationId, userId) => {
    try {
      const response = await axiosInstance.post("/notifications/delete", {
        notification_id: notificationId,
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },
};

export default NotificationService;
