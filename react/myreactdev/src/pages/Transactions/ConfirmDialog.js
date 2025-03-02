// ConfirmDialog.js
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Box,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";

const ConfirmDialog = ({
  open,
  onClose,
  confirmPrice,
  countdown,
  totalTime = 10,
  onConfirm,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { padding: 2, borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
        تأیید نهایی معامله
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center" }}>
        <DialogContentText>قیمت جدید: {confirmPrice}</DialogContentText>
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
          <Box position="relative" display="inline-flex">
            <CircularProgress
              variant="determinate"
              value={(countdown / totalTime) * 100}
              size={80}
              sx={{ color: "green" }}
            />
            <Box
              position="absolute"
              top={0}
              left={0}
              bottom={0}
              right={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h6" component="div" color="text.primary">
                {countdown}
              </Typography>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ mt: 1 }}>
            لطفاً در عرض {totalTime} ثانیه تأیید کنید.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClose} color="error" variant="outlined">
          لغو
        </Button>
        <Button
          onClick={onConfirm}
          color="success"
          variant="contained"
          autoFocus
        >
          تأیید
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
