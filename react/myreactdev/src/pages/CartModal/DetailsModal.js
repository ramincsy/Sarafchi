import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardContent,
  Slide,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// ثابت‌ها و تنظیمات
const FIELDS = {
  ID: { key: "id", label: "شناسه" },
  USER: { key: "user", label: "کاربر" },
  STATUS: { key: "status", label: "وضعیت" },
  DATE: { key: "date", label: "تاریخ" },
  AMOUNT: { key: "amount", label: "مقدار" },
  DESTINATION: { key: "DestinationAddress", label: "ادرس مقصد" },
  ACCOUNT_HOLDER: { key: "AccountHolderName", label: "گیرنده" },
  IBAN: { key: "IBAN", label: "شبا" },
  CURRENCY: { key: "CurrencyType", label: "ارز" },
};

// ترنزیشن Slide برای انیمیشن مودال
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// استایل‌های سفارشی
const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    backgroundColor: "rgba(241, 172, 172, 0.18)",
    borderRadius: "15px",
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
  },
}));

const StyledCard = styled(Card)(({ theme }) => ({
  cursor: "pointer",
  textAlign: "center",
  borderRadius: theme.shape.borderRadius * 2,
  background: "rgba(3, 159, 250, 0.38)",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "scale(1.05)",
    boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.3)",
  },
}));

const StyledCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2),
  "& .MuiTypography-body1": {
    color: theme.palette.common.white,
    fontWeight: "bold",
  },
  "& .MuiTypography-body2": {
    color: theme.palette.common.white,
  },
}));

// توابع کمکی برای استخراج اطلاعات آیتم
const getItemId = (item) =>
  item?.WithdrawalID || item?.TransactionID || item?.id || "N/A";
const getItemUser = (item) => item?.UserID || item?.user || "N/A";
const getItemStatus = (item) => item?.Status || item?.status || "N/A";
const getItemDate = (item) => {
  const d =
    item?.CreatedAt ||
    item?.WithdrawalDateTime ||
    item?.TransactionDateTime ||
    item?.date;
  return d ? new Date(d).toLocaleString() : "N/A";
};
const getItemAmount = (item) => item?.Amount || item?.Quantity || "N/A";

// کامپوننت نمایش یک فیلد
const CardField = ({ label, value }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
    <Typography variant="body2" sx={{ textAlign: "left", color: "#9e9e9e" }}>
      {value}
    </Typography>
    <Typography variant="body2">{label}:</Typography>
  </Box>
);

// کامپوننت کارت با اطلاعات آیتم
const ItemCard = ({ item }) => {
  return (
    <StyledCard sx={{ width: "100%", maxWidth: 300, mb: 1 }}>
      <StyledCardContent>
        {/* فیلدهای ثابت همیشه نمایش داده می‌شوند */}
        <CardField label={FIELDS.ID.label} value={getItemId(item)} />
        <CardField label={FIELDS.USER.label} value={getItemUser(item)} />
        <CardField label={FIELDS.STATUS.label} value={getItemStatus(item)} />
        <CardField label={FIELDS.DATE.label} value={getItemDate(item)} />
        <CardField
          label={FIELDS.AMOUNT.label}
          value={getItemAmount(item) || "-"}
        />

        {/* فیلدهای شرطی فقط اگر موجود باشند نمایش داده می‌شوند */}
        {Object.entries(FIELDS).map(([key, { key: fieldKey, label }]) => {
          // فقط برای فیلدهای خاص که تاکنون پردازش نشده‌اند
          if (
            fieldKey !== "id" &&
            fieldKey !== "user" &&
            fieldKey !== "status" &&
            fieldKey !== "date" &&
            fieldKey !== "amount" &&
            item[fieldKey]
          ) {
            return (
              <CardField key={fieldKey} label={label} value={item[fieldKey]} />
            );
          }
          return null;
        })}
      </StyledCardContent>
    </StyledCard>
  );
};

const DetailsModal = ({ open, onClose, title, data }) => {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "1.5rem",
          color: "theme.palette.common.white",
          backgroundColor: "rgba(237, 248, 84, 0.47)",
          py: 2,
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ py: 3, paddingTop: "20px !important" }}>
        {data.length === 0 ? (
          <Typography
            variant="body1"
            align="center"
            sx={{ color: "text.secondary" }}
          >
            هیچ داده‌ای موجود نیست.
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              justifyContent: "center",
            }}
          >
            {data.map((item, index) => (
              <ItemCard key={index} item={item} />
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", p: 1 }}>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: "primary.main",
            color: "white",
            "&:hover": {
              backgroundColor: "primary.dark",
            },
          }}
        >
          بستن
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default DetailsModal;
