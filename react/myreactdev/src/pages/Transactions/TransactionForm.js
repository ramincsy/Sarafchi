// TransactionForm.js
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
} from "react";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import LeverSlider from "components/common/LeverSlider";
import ConfirmDialog from "./ConfirmDialog";
import { useTransactionData } from "./useTransactionData";
import PriceService from "services/PriceService";
import ApiManager from "services/ApiManager";
import AuthContext from "contexts/AuthContext";

/**
 * فرم اصلی ثبت معامله (اتوماتیک / پیشنهادی / روی خط)
 * @param {object} props
 *  - mode: "automatic" | "suggested" | "live"
 *  - transactionType: 'sell' یا 'buy' (پیش‌فرض = 'sell')
 *  - currency: نوع ارز (پیش‌فرض 'USDT')
 *  - onSuccess: تابعی که بعد از ثبت موفق معامله اجرا می‌شود (برای رفرش جدول)
 */

const TransactionForm = ({
  mode = "automatic",
  transactionType = "sell",
  currency = "USDT",
  onSuccess,
}) => {
  // دریافت userId از کانتکست
  const { userInfo } = useContext(AuthContext);
  const userId = userInfo?.UserID;
  console.log(userId);

  // دریافت قیمت و موجودی با استفاده از هوک
  const { price, usdtBalance } = useTransactionData(userId);

  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [manualPrice, setManualPrice] = useState("");
  const [quantityError, setQuantityError] = useState("");

  // وضعیت‌های مربوط به دیالوگ تأیید
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmPrice, setConfirmPrice] = useState(null);
  const [countdown, setCountdown] = useState(10);

  // محاسبه قیمت مؤثر بر اساس حالت (automatic: از API، در غیر این صورت: دستی)
  const effectivePrice = useMemo(() => {
    return mode === "automatic" ? price : manualPrice || price;
  }, [mode, price, manualPrice]);

  // محاسبه مجموع بر اساس تعداد و قیمت مؤثر
  useEffect(() => {
    if (effectivePrice !== null && quantity !== "" && !isNaN(effectivePrice)) {
      setTotal(parseFloat(quantity) * parseFloat(effectivePrice));
    } else {
      setTotal(null);
    }
  }, [quantity, effectivePrice]);

  // تغییر تعداد (ورودی دستی)
  const handleQuantityChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (!isNaN(value)) {
        const parsedValue = parseFloat(value);
        // در صورت فروش و انتخاب ارز USDT، موجودی را بررسی می‌کنیم
        if (transactionType === "sell" && currency === "USDT") {
          const currentUSDTBalance = usdtBalance || 0;
          if (parsedValue > currentUSDTBalance) {
            setQuantityError("مقدار وارد شده بیشتر از موجودی USDT شما است.");
          } else {
            setQuantityError("");
          }
        }
        setQuantity(parsedValue);
      } else {
        setQuantityError("لطفاً یک عدد معتبر وارد کنید.");
      }
    },
    [usdtBalance, transactionType, currency]
  );

  // تغییر تعداد با استفاده از اسلایدر
  const handleSliderQuantityChange = useCallback(
    (calculatedQuantity) => {
      let newQuantity = calculatedQuantity;
      if (mode === "live" || mode === "suggested") {
        newQuantity = Math.floor(calculatedQuantity);
      }
      if (transactionType === "sell" && currency === "USDT") {
        if (newQuantity > usdtBalance) {
          setQuantityError("مقدار وارد شده بیشتر از موجودی USDT شما است.");
        } else {
          setQuantityError("");
        }
      }
      setQuantity(newQuantity);
    },
    [mode, transactionType, currency, usdtBalance]
  );

  // نهایی‌سازی تراکنش
  const finalizeTransaction = useCallback(async () => {
    const txType =
      mode === "automatic"
        ? "Automatic"
        : mode === "suggested"
        ? "Suggested"
        : mode === "live"
        ? "Live"
        : "";
    const transactionData = {
      UserID: userId,
      Quantity: parseFloat(quantity),
      Price: parseFloat(confirmPrice || effectivePrice),
      TransactionType: txType,
      Position: transactionType === "buy" ? "Buy" : "Sell",
      CurrencyType: currency,
      CreatedBy: userId,
    };

    try {
      await ApiManager.TransactionsService.createTransaction(transactionData);
      alert("تراکنش با موفقیت ثبت شد");
      // پاک‌سازی فرم
      setQuantity("");
      setManualPrice("");
      setQuantityError("");
      setTotal(null);
      setConfirmDialogOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("خطا در ثبت تراکنش:", error.response?.data?.error);
      alert(
        "خطا در ثبت تراکنش: " +
          (error.response?.data?.error || error.message || "Unknown error")
      );
    }
  }, [
    mode,
    userId,
    quantity,
    confirmPrice,
    effectivePrice,
    transactionType,
    currency,
    onSuccess,
  ]);

  const priceThreshold = 0.01;

  // سابمیت فرم
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (quantityError) {
        alert(quantityError);
        return;
      }
      if ((mode === "live" || mode === "suggested") && !manualPrice) {
        alert("لطفاً یک قیمت معتبر وارد کنید.");
        return;
      }

      if (mode === "automatic") {
        try {
          const fetchedPrice = await PriceService.fetchUSDTPrice("sell");
          if (!fetchedPrice) {
            alert("خطا در دریافت قیمت جدید");
            return;
          }
          if (Math.abs(fetchedPrice - effectivePrice) < priceThreshold) {
            setConfirmPrice(fetchedPrice);
            setConfirmDialogOpen(true);
            setCountdown(10);
            const timer = setInterval(() => {
              setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            setTimeout(() => {
              clearInterval(timer);
              setConfirmDialogOpen(false);
            }, 10000);
          } else {
            alert("قیمت تغییر کرده است؛ لطفاً دوباره اقدام کنید.");
          }
        } catch (err) {
          console.error("خطا در دریافت قیمت جدید:", err);
          alert("خطا در دریافت قیمت جدید");
        }
      } else {
        finalizeTransaction();
      }
    },
    [
      mode,
      quantityError,
      manualPrice,
      effectivePrice,
      finalizeTransaction,
      priceThreshold,
    ]
  );

  // تعیین برچسب فیلد قیمت بر اساس حالت
  const priceLabel = useMemo(() => {
    if (mode === "automatic") return "قیمت (از API)";
    if (mode === "live") return "قیمت (دستی)";
    if (mode === "suggested") return "قیمت (پیشنهاد)";
    return "";
  }, [mode]);

  return (
    <Paper
      elevation={3}
      sx={{
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.66)",
        maxHeight: "calc(100vh - 100px)",
        overflow: "auto",
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem", mb: 1 }}>
        ثبت معامله جدید (
        {mode === "automatic"
          ? "اتوماتیک"
          : mode === "suggested"
          ? "پیشنهادی"
          : mode === "live"
          ? "روی خط"
          : "ناشناس"}
        )
      </Typography>

      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="dense" size="small">
          <InputLabel sx={{ fontSize: "0.8rem" }}>نوع معامله</InputLabel>
          <Select
            value={transactionType}
            // در صورت نیاز به تغییر نوع معامله، این قسمت را می‌توان به state تبدیل کرد
            size="small"
            sx={{ fontSize: "0.8rem" }}
          >
            <MenuItem value="sell" sx={{ fontSize: "0.8rem" }}>
              فروش
            </MenuItem>
            {/*
              اگر در آینده نیاز به افزودن گزینه خرید باشد:
              <MenuItem value="buy" sx={{ fontSize: "0.8rem" }}>
                خرید
              </MenuItem>
            */}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense" size="small">
          <InputLabel sx={{ fontSize: "0.8rem" }}>نوع ارز</InputLabel>
          <Select
            value={currency}
            // در صورت نیاز به تغییر نوع ارز، این قسمت را می‌توان به state تبدیل کرد
            size="small"
            sx={{ fontSize: "0.8rem" }}
          >
            <MenuItem value="USDT" sx={{ fontSize: "0.8rem" }}>
              USDT
            </MenuItem>
            {/*
              برای ارزهای دیگر، گزینه‌های مناسب را اضافه کنید
            */}
          </Select>
        </FormControl>

        <TextField
          label="تعداد"
          type="number"
          fullWidth
          margin="dense"
          size="small"
          value={quantity || ""}
          onChange={handleQuantityChange}
          error={!!quantityError}
          helperText={quantityError}
          sx={{ fontSize: "0.8rem" }}
        />

        <LeverSlider
          price={mode === "automatic" ? price : manualPrice || price}
          currency={currency}
          mode={mode}
          quantity={quantity}
          onQuantityChange={handleSliderQuantityChange}
          sx={{ fontSize: "0.8rem", mt: 1 }}
        />

        <TextField
          label={priceLabel}
          fullWidth
          margin="dense"
          size="small"
          value={
            mode === "automatic"
              ? price !== null
                ? price
                : "در حال بارگذاری..."
              : manualPrice
          }
          onChange={
            mode === "automatic"
              ? undefined
              : (e) => setManualPrice(e.target.value)
          }
          InputProps={{ readOnly: mode === "automatic" }}
          sx={{ fontSize: "0.8rem" }}
        />

        <TextField
          label="مجموع"
          fullWidth
          margin="dense"
          size="small"
          value={total !== null ? total : "در حال محاسبه..."}
          InputProps={{ readOnly: true }}
          sx={{ fontSize: "0.8rem" }}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 1, fontSize: "0.8rem", py: 1 }}
        >
          ثبت معامله
        </Button>
      </form>

      <ConfirmDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        confirmPrice={confirmPrice}
        countdown={countdown}
        onConfirm={finalizeTransaction}
      />
    </Paper>
  );
};

export default TransactionForm;
