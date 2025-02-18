import React from "react";
import {
  Modal,
  Backdrop,
  Fade,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "400px" },
  bgcolor: "rgba(0, 0, 0, 0.38)",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "16px",
  boxShadow: 24,
  p: 4,
  backdropFilter: "blur(16px)",
  display: "flex", // افزودن این خط
  flexDirection: "column", // افزودن این خط
  alignItems: "center", // افزودن این خط
};

const textFieldStyle = {
  "& .MuiInputLabel-root": {
    color: "rgba(255,255,255,0.8) !important",
    transform: "translate(14px, 14px)",
    "&.Mui-focused, &.MuiInputLabel-shrink": {
      transform: "translate(14px, -9px) scale(0.75)",
      color: "#FE6B8B !important",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: "0 4px",
      borderRadius: "4px",
    },
  },
  "& .MuiOutlinedInput-root": {
    backgroundColor: "rgba(255, 255, 255, 0.66)",
    borderRadius: "8px",
    margin: "8px 0",
  },
};

const buttonStyle = {
  mt: 3,
  mb: 2,
  background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
  color: "white",
  fontSize: "0.9rem", // کوچک‌تر کردن اندازه فونت
  padding: "8px 16px", // کاهش پدینگ
  borderRadius: "8px",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
    transform: "scale(1.02)",
  },
  "&:disabled": {
    background: "rgba(255,255,255,0.2)",
    color: "rgba(255,255,255,0.5)",
    transform: "none",
  },
  width: "40%", // کاهش عرض دکمه
  height: "50px", // کاهش ارتفاع دکمه
};

const TwoFactorModal = ({
  open,
  twoFactorCode,
  setTwoFactorCode,
  onSubmit,
  onClose,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Box sx={modalStyle}>
          <Typography
            variant="h6"
            sx={{ color: "white", textAlign: "center", mb: 3 }}
          >
            لطفاً کد ارسال شده را وارد کنید
          </Typography>
          <TextField
            fullWidth
            label="کد تایید"
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            sx={textFieldStyle}
            InputProps={{
              sx: {
                input: {
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontSize: "1.2rem",
                },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={onSubmit}
            sx={buttonStyle}
          >
            تایید
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
};

export default TwoFactorModal;
