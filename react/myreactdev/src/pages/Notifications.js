import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Badge,
  Menu,
  MenuItem,
  IconButton,
  Button,
  TextField,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import NotificationService from "services/NotificationService";
import AuthContext from "contexts/AuthContext";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [newNotification, setNewNotification] = useState({
    user_id: "",
    title: "",
    message: "",
    type: "general",
  });
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const { userInfo } = useContext(AuthContext);

  useEffect(() => {
    if (userInfo?.UserID) {
      fetchNotifications();
    }
  }, [userInfo]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NotificationService.fetchNotifications(
        userInfo.UserID
      );
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showSnackbar("Error fetching notifications", "error");
    } finally {
      setLoading(false);
    }
  }, [userInfo]);

  const handleNotificationChange = (field, value) => {
    setNewNotification((prev) => ({ ...prev, [field]: value }));
  };

  const sendNotification = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NotificationService.sendNotification(newNotification);

      setNotifications((prev) => [
        {
          NotificationID: data.NotificationID, // مقدار واقعی از سرور
          Title: newNotification.title,
          Message: newNotification.message,
          IsRead: false,
          Timestamp: data.Timestamp || new Date().toISOString(), // زمان بازگشتی از سرور یا زمان فعلی
          Type: newNotification.type,
        },
        ...prev,
      ]);

      setNewNotification({
        user_id: "",
        title: "",
        message: "",
        type: "general",
      });
      showSnackbar("Notification sent successfully", "success");
    } catch (error) {
      console.error("Error sending notification:", error);
      showSnackbar("Error sending notification", "error");
    } finally {
      setLoading(false);
    }
  }, [newNotification]);

  const markAsRead = useCallback(
    async (notificationIds) => {
      try {
        setLoading(true);
        await NotificationService.markAsRead(notificationIds, userInfo.UserID);
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification.NotificationID)
              ? { ...notification, IsRead: true }
              : notification
          )
        );
        showSnackbar("Notifications marked as read", "success");
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        showSnackbar("Error marking notifications as read", "error");
      } finally {
        setLoading(false);
      }
    },
    [userInfo]
  );

  const handleDeleteNotification = useCallback(
    async (notificationId) => {
      try {
        setLoading(true);
        await NotificationService.deleteNotification(
          notificationId,
          userInfo.UserID
        );
        setNotifications((prev) =>
          prev.filter((n) => n.NotificationID !== notificationId)
        );
        showSnackbar("Notification deleted successfully", "success");
      } catch (error) {
        console.error("Error deleting notification:", error);
        showSnackbar("Error deleting notification", "error");
      } finally {
        setLoading(false);
      }
    },
    [userInfo]
  );

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <div>
      <IconButton
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={loading}
        aria-label="Open notifications"
      >
        <Badge
          badgeContent={notifications.filter((n) => !n.IsRead).length}
          color="error"
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 350,
          },
        }}
      >
        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.NotificationID}>
              <ListItem
                button
                onClick={() => markAsRead([notification.NotificationID])}
              >
                <ListItemText
                  primary={
                    <Typography
                      variant="subtitle1"
                      style={{ fontWeight: "bold" }}
                    >
                      {notification.Title}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="textSecondary">
                        {notification.Message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {new Date(notification.Timestamp).toLocaleString()}
                      </Typography>
                    </>
                  }
                />
                <Button
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification.NotificationID);
                  }}
                  disabled={loading}
                >
                  Delete
                </Button>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          {notifications.length > 0 && (
            <MenuItem
              onClick={() =>
                markAsRead(notifications.map((n) => n.NotificationID))
              }
              disabled={loading}
            >
              Mark all as read
            </MenuItem>
          )}
        </List>
      </Menu>

      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Send Notification
        </Typography>
        <TextField
          label="User ID"
          value={newNotification.user_id}
          onChange={(e) => handleNotificationChange("user_id", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Title"
          value={newNotification.title}
          onChange={(e) => handleNotificationChange("title", e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Message"
          value={newNotification.message}
          onChange={(e) => handleNotificationChange("message", e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={sendNotification}
          style={{ marginTop: 16 }}
          disabled={loading}
        >
          Send Notification
        </Button>
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
    </div>
  );
};

export default Notifications;
