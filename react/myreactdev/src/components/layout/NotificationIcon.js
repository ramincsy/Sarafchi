import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Badge,
  Menu,
  MenuItem,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Snackbar,
  Alert,
  Typography,
  Box,
  useTheme,
  Fade,
  Grow,
  Slide,
  Avatar,
  ListItemAvatar,
  Card,
  CardContent,
  CardActionArea,
  Paper,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"; // آیکون بهتر
import NotificationService from "services/NotificationService";
import AuthContext from "contexts/AuthContext";

const NotificationIcon = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
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

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {/* آیکون نوتیفیکیشن */}
      <IconButton
        color="inherit"
        onClick={handleOpenMenu}
        disabled={loading}
        aria-label="Open notifications"
      >
        <Badge
          badgeContent={notifications.filter((n) => !n.IsRead).length}
          color="error"
        >
          <NotificationsActiveIcon /> {/* آیکون بهتر */}
        </Badge>
      </IconButton>

      {/* منوی نوتیفیکیشن‌ها */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: 400, // عرض بیشتر برای زیبایی
            backgroundColor: theme.palette.background.paper,
            borderRadius: 12, // گوشه‌های گرد
            boxShadow: theme.shadows[10], // سایه زیبا
          },
        }}
        TransitionComponent={Slide} // انیمیشن Slide
      >
        <List>
          {notifications.map((notification) => (
            <React.Fragment key={notification.NotificationID}>
              <Card
                sx={{
                  margin: 1,
                  backgroundColor: notification.IsRead
                    ? theme.palette.action.selected
                    : theme.palette.action.hover,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <CardActionArea
                  onClick={() => markAsRead([notification.NotificationID])}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        alt={notification.Title}
                        src={notification.ImageUrl || "/default-avatar.png"}
                        sx={{ marginRight: 2 }}
                      />
                      <Box flexGrow={1}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: "bold",
                            color: theme.palette.text.primary,
                          }}
                        >
                          {notification.Title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {notification.Message}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: theme.palette.text.secondary }}
                        >
                          {new Date(notification.Timestamp).toLocaleString()}
                        </Typography>
                      </Box>
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
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
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
              <Typography
                variant="body2"
                sx={{ color: theme.palette.text.primary }}
              >
                Mark all as read
              </Typography>
            </MenuItem>
          )}
        </List>
      </Menu>

      {/* Snackbar برای نمایش پیام‌ها */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        TransitionComponent={Grow}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationIcon;
