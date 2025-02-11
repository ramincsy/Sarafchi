import React, { useState, useCallback, useContext, useEffect } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import PushNotificationService from "services/PushNotificationService";
import AuthContext from "contexts/AuthContext";
import { onMessageListener, requestForToken } from "pages/firebase";
import { getUserID } from "utils/userUtils";

const SendPushNotificationPage = () => {
  const [pushNotification, setPushNotification] = useState({
    user_id: "",
    title: "",
    message: "",
  });
  const [notifications, setNotifications] = useState([]);
  const [firebaseMessages, setFirebaseMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [showPermissionButton, setShowPermissionButton] = useState(false); // حالت جدید برای نمایش دکمه

  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    console.log("Component mounted or userInfo updated");

    const initializePushNotifications = async () => {
      const user_id = getUserID(userInfo);
      if (!user_id) {
        console.error("Failed to retrieve user_id");
        showSnackbar("User ID not found", "error");
        return;
      }

      console.log("User ID found:", user_id);

      // بررسی پشتیبانی مرورگر
      if (!isPushSupported()) {
        console.warn("مرورگر شما از نوتیفیکیشن‌های Push پشتیبانی نمی‌کند.");
        showSnackbar(
          "مرورگر شما از نوتیفیکیشن‌های Push پشتیبانی نمی‌کند. لطفاً از Google Chrome یا Firefox استفاده کنید.",
          "warning"
        );
        return;
      }

      // مرحله ۱: دریافت نوتیفیکیشن‌ها
      console.log("Fetching notifications for user:", user_id);
      await fetchNotifications(user_id);

      // بررسی آیا کاربر قبلاً مجوز داده است یا خیر
      const permission = Notification.permission;
      if (permission === "default") {
        setShowPermissionButton(true); // نمایش دکمه اگر مجوز داده نشده است
      } else if (permission === "granted") {
        // اگر مجوز داده شده است، توکن را دریافت و ذخیره کنید
        requestAndSaveToken(user_id);
      }
    };
    initializePushNotifications();
  }, [userInfo]);

  const isPushSupported = () => {
    return "serviceWorker" in navigator && "PushManager" in window;
  };

  const requestAndSaveToken = async (user_id) => {
    if (!isPushSupported()) {
      showSnackbar(
        "مرورگر شما از نوتیفیکیشن‌های Push پشتیبانی نمی‌کند. لطفاً از Google Chrome یا Firefox استفاده کنید.",
        "warning"
      );
      return;
    }
    console.log("Requesting Firebase token...");

    try {
      // دریافت توکن
      const token = await requestForToken();

      if (token) {
        console.log("Firebase token received successfully:", token);

        // ذخیره توکن در سرور
        try {
          await PushNotificationService.saveToken(token, user_id);
          console.log("Token saved successfully on the server.");
        } catch (saveError) {
          console.error("Error saving token on the server:", saveError);
          showSnackbar("Failed to save Firebase token on the server", "error");
          return; // اگر ذخیره توکن شکست خورد، ادامه ندهید
        }

        // تنظیم شنونده پیام‌ها
        console.log("Setting up Firebase message listener...");
        onMessageListener()
          .then((payload) => {
            console.log("Message received from Firebase:", payload);

            // بررسی آیا پیام حاوی اطلاعات notification است
            if (payload?.notification) {
              const notificationTitle =
                payload.notification.title || "New Notification";
              const notificationOptions = {
                body:
                  payload.notification.body || "You have a new notification",
                icon: "pagespng-file_10511554.png", // مسیر آیکون را وارد کنید
              };

              // نمایش نوتیفیکیشن
              console.log(
                "Displaying notification with title:",
                notificationTitle
              );
              new Notification(notificationTitle, notificationOptions);

              // اضافه کردن پیام به لیست پیام‌ها
              setFirebaseMessages((prev) => {
                const newMessages = [...prev, payload];
                return newMessages.slice(-10); // فقط ۱۰ پیام آخر را نگه دارید
              });

              // نمایش اسنک‌بار
              showSnackbar(
                `New notification: ${payload.notification.title}`,
                "info"
              );
            } else if (payload?.data) {
              // اگر فقط data موجود باشد
              const notificationTitle = payload.data.title || "New Message";
              const notificationOptions = {
                body: payload.data.body || "You have a new message",
                icon: "/path/to/icon.png", // مسیر آیکون را وارد کنید
              };

              console.log(
                "Displaying data notification with title:",
                notificationTitle
              );
              new Notification(notificationTitle, notificationOptions);
              showSnackbar(`New message: ${payload.data.title}`, "info");
            } else {
              console.warn(
                "Payload does not contain notification or data:",
                payload
              );
            }
          })
          .catch((err) => {
            console.error("Error in Firebase message listener:", err);
            showSnackbar("Failed to listen to Firebase messages", "error");
          });
      } else {
        console.warn(
          "No Firebase token received. User might have denied notification permission."
        );
        showSnackbar("User denied notification permission", "warning");
      }
    } catch (err) {
      console.error("Error retrieving Firebase token:", err);
      showSnackbar("Failed to retrieve Firebase token", "error");
    }
  };

  const handleRequestPermission = async () => {
    if (!isPushSupported()) {
      showSnackbar(
        "مرورگر شما از نوتیفیکیشن‌های Push پشتیبانی نمی‌کند. لطفاً از Google Chrome یا Firefox استفاده کنید.",
        "warning"
      );
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const user_id = getUserID(userInfo);
      if (user_id) {
        await requestAndSaveToken(user_id);
        setShowPermissionButton(false); // مخفی کردن دکمه پس از دریافت مجوز
      }
    } else {
      showSnackbar("User denied notification permission", "warning");
    }
  };

  const fetchNotifications = useCallback(async (user_id) => {
    console.log("Fetching notifications...");
    try {
      setLoading(true);
      const data = await PushNotificationService.fetchNotifications(user_id);
      console.log("Notifications fetched successfully:", data);
      console.log("Type of notifications data:", typeof data); // Debugging
      setNotifications(data || []); // Ensure data is an array
    } catch (error) {
      console.error("Error fetching notifications:", error.response || error);
      showSnackbar("Error fetching notifications", "error");
      setNotifications([]); // Set to empty array in case of error
    } finally {
      setLoading(false);
    }
  }, []);

  const sendPushNotification = useCallback(async () => {
    if (!pushNotification.user_id) {
      showSnackbar("User ID is required", "error");
      return;
    }

    console.log("Sending push notification...");
    console.log("Push notification payload:", pushNotification);
    try {
      setLoading(true);
      const response = await PushNotificationService.sendPushNotification(
        pushNotification
      );
      console.log("Push notification payload:", pushNotification);

      console.log("Push notification sent successfully:", response);
      setPushNotification({
        user_id: "",
        title: "",
        message: "",
      });
      const user_id = getUserID(userInfo);
      await fetchNotifications(user_id);
      showSnackbar("Push Notification sent successfully", "success");
    } catch (error) {
      console.error(
        "Error sending push notification:",
        error.response || error
      );
      showSnackbar("Error sending push notification", "error");
    } finally {
      setLoading(false);
    }
  }, [pushNotification, userInfo, fetchNotifications]);

  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      if (!pushNotification.user_id) {
        showSnackbar("User ID is required", "error");
        return;
      }

      console.log("Deleting notification with ID:", notificationId);
      try {
        setLoading(true);
        const response = await PushNotificationService.deleteNotification(
          notificationId,
          pushNotification.user_id
        );
        console.log("Notification deleted successfully:", response);
        const user_id = getUserID(userInfo);
        await fetchNotifications(user_id);
        showSnackbar("Notification deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting notification:", error.response || error);
        showSnackbar("Error deleting notification", "error");
      } finally {
        setLoading(false);
      }
    },
    [pushNotification.user_id, userInfo, fetchNotifications]
  );

  const showSnackbar = (message, severity) => {
    console.log(`Showing snackbar: ${message} with severity: ${severity}`);
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    console.log("Closing snackbar");
    setSnackbarOpen(false);
  };

  return (
    <Box mt={4}>
      <Typography variant="h4" gutterBottom>
        Send Push Notification
      </Typography>

      {/* دکمه درخواست مجوز */}
      {showPermissionButton && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleRequestPermission}
          style={{ marginBottom: 16 }}
        >
          Enable Notifications
        </Button>
      )}

      <TextField
        label="User ID"
        value={pushNotification.user_id}
        onChange={(e) =>
          setPushNotification((prev) => ({
            ...prev,
            user_id: e.target.value,
          }))
        }
        fullWidth
        margin="normal"
      />
      <TextField
        label="Title"
        value={pushNotification.title}
        onChange={(e) =>
          setPushNotification((prev) => ({
            ...prev,
            title: e.target.value,
          }))
        }
        fullWidth
        margin="normal"
      />
      <TextField
        label="Message"
        value={pushNotification.message}
        onChange={(e) =>
          setPushNotification((prev) => ({
            ...prev,
            message: e.target.value,
          }))
        }
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={sendPushNotification}
        style={{ marginTop: 16 }}
        disabled={loading}
      >
        Send Push Notification
      </Button>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Sent Notifications
        </Typography>
        <List>
          {Array.isArray(notifications) && notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <React.Fragment key={notification.NotificationID || index}>
                <ListItem>
                  <ListItemText
                    primary={notification.title}
                    secondary={`${notification.message} - ${new Date(
                      notification.timestamp
                    ).toLocaleString()}`}
                  />
                  <Button
                    color="secondary"
                    onClick={() =>
                      handleDeleteNotification(notification.NotificationID)
                    }
                    disabled={loading}
                  >
                    Delete
                  </Button>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <Typography variant="body1" style={{ padding: 16 }}>
              No notifications found.
            </Typography>
          )}
        </List>
      </Box>

      <Box mt={4}>
        <Typography variant="h5" gutterBottom>
          Firebase Messages
        </Typography>
        <List>
          {firebaseMessages.map((message, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={message.notification?.title || "No Title"}
                secondary={message.notification?.body || "No Body"}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SendPushNotificationPage;
