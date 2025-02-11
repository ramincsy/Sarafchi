import React, { useState, useCallback, useContext } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import NotificationService from "services/NotificationService";
import AuthContext from "contexts/AuthContext";

const SendNotificationPage = () => {
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

  const handleNotificationChange = (field, value) => {
    setNewNotification((prev) => ({ ...prev, [field]: value }));
  };

  const sendNotification = useCallback(async () => {
    try {
      setLoading(true);
      const data = await NotificationService.sendNotification(newNotification);
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

  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
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

export default SendNotificationPage;
