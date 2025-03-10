import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Alert,
  Card,
  CardContent,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
} from "@mui/material";
import GaugeChart from "react-gauge-chart";
import EqualityDataService from "services/EqualityDataService";
import { calculateEquality } from "pages/EqualitySystem/equalityCalculator";
import { splitUsersBySide } from "pages/EqualitySystem/roleUtils";

// تابع کمکی جهت تعیین آستانه اختلاف برای ارزهای مختلف
const getDifferenceThreshold = (currency) => {
  if (currency === "TOMAN") return 500;
  if (currency === "USDT") return 10;
  return 0; // برای سایر ارزها، در صورت وجود اختلاف، پیشنهاد داده می‌شود.
};

const BuySellPage = () => {
  const [usersData, setUsersData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [discrepancies, setDiscrepancies] = useState([]);
  const [colleagueList, setColleagueList] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [priceError, setPriceError] = useState("");

  // اضافه کردن فیلدهای فرم برای اطلاعات جدید در صورت انتخاب "سایر"
  const [formData, setFormData] = useState({
    operationType: "",
    amount: "",
    price: "",
    total: 0,
    counterparty: "",
    // اطلاعات طرف معامله جدید
    otherFirstName: "",
    otherLastName: "",
    otherMobile: "",
    otherAccountNumber: "",
  });

  // دریافت اطلاعات کاربران از EqualityDataService
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await EqualityDataService.fetchEqualityData();
        if (res.success) {
          setUsersData(res.data);
        } else {
          setError(res.error || "خطا در گرفتن داده‌های کاربران");
        }
      } catch (err) {
        setError("ارتباط با سرور(کاربران) ناموفق بود");
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  // محاسبه اختلاف‌های برابری و لیست همکاران بر اساس usersData
  useEffect(() => {
    if (usersData.length > 0) {
      // استخراج ارزهای موجود
      const currencySet = new Set();
      usersData.forEach((user) => {
        (user.balances || []).forEach((b) => {
          if (b.CurrencyType) currencySet.add(b.CurrencyType.toUpperCase());
        });
      });
      const currencyList = Array.from(currencySet);

      // محاسبه اختلاف برای هر ارز با استفاده از calculateEquality
      const computedDiscrepancies = currencyList.map((currency) =>
        calculateEquality(usersData, currency, {
          includeDebt: true,
          includeCredit: true,
          includeLoan: true,
        })
      );
      setDiscrepancies(computedDiscrepancies);

      // لیست همکاران: کاربرانی که نقش "همکار" دارند
      const colleagues = usersData.filter((user) =>
        (user.roles || []).some((role) => role.toLowerCase() === "همکار")
      );
      setColleagueList(colleagues);
    }
  }, [usersData]);

  // رندر نمودارهای وضعیت برابری برای هر ارز
  const renderGaugeCharts = () => {
    return (
      <Grid container spacing={2}>
        {discrepancies.map((disc, index) => {
          const calcGaugePercent = (userSide, companySide) => {
            if (userSide === 0 && companySide === 0) return 0.5;
            if (companySide === 0) return userSide > 0 ? 1 : 0;
            return Math.max(0, Math.min(1, userSide / companySide / 2));
          };
          const percent = calcGaugePercent(disc.userSide, disc.companySide);
          const ratio =
            disc.companySide === 0
              ? disc.userSide > 0
                ? Infinity
                : 0
              : disc.userSide / disc.companySide;
          return (
            <Grid item xs={12} md={4} key={index}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h6">{disc.currency}</Typography>
                  <GaugeChart
                    id={`gauge-${disc.currency}`}
                    nrOfLevels={20}
                    percent={percent}
                    arcWidth={0.3}
                    needleColor="#345243"
                    needleBaseColor="#345243"
                    style={{ width: "180px", margin: "auto" }}
                  />
                  <Typography variant="body2">
                    نسبت: {disc.companySide === 0 ? "∞" : ratio.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    کاربران: {disc.userSide}
                  </Typography>
                  <Typography variant="body2">
                    شرکت: {disc.companySide}
                  </Typography>
                  <Typography variant="body2">
                    اختلاف: {disc.difference}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // رندر کارت‌های پیشنهاد سیستم
  const renderSuggestionCards = () => {
    return discrepancies.map((disc, index) => {
      // اگر اختلاف صفر باشد، هیچ پیشنهادی نمایش داده نمی‌شود.
      if (disc.difference === 0) return null;

      const absDiff = Math.abs(disc.difference);
      const threshold = getDifferenceThreshold(disc.currency);
      let cardVariant = "standard"; // پیش‌فرض: پیشنهاد اصلی
      // برای ارز USDT اختلاف‌های جزئی در یک باکس جدا نشان داده شود
      if (disc.currency === "USDT" && absDiff < threshold) {
        cardVariant = "moderate";
      }
      // برای ارز TOMAN، اگر اختلاف کمتر از حد تعیین شده باشد، پیشنهاد نشان داده نمی‌شود.
      if (disc.currency === "TOMAN" && absDiff < threshold) {
        return null;
      }

      // فرض می‌کنیم قیمت میانگین از سیستم دریافت شده یا به صورت نمونه 90000 است.
      const avgPrice = disc.averagePrice || 90000;
      // حد نسبی پیشنهادی به عنوان مثال 200 واحد بالاتر از میانگین
      const thresholdPrice = avgPrice + 200;
      // تعیین عملیات؛ اگر اختلاف مثبت باشد، پیشنهاد خرید و در غیر این صورت فروش است.
      const action = disc.difference > 0 ? "خرید" : "فروش";

      return (
        <Card
          key={index}
          sx={{
            marginBottom: 2,
            border:
              cardVariant === "moderate"
                ? "2px dashed #FFA500"
                : "1px solid #1976d2",
            backgroundColor: cardVariant === "moderate" ? "#fff3e0" : "inherit",
          }}
        >
          <CardContent>
            <Typography variant="h6">
              {disc.currency} - پیشنهاد تیم {action}
            </Typography>
            <Typography>اختلاف موجودی: {absDiff}</Typography>
            <Typography>قیمت میانگین: {avgPrice}</Typography>
            <Typography>حد نسبی پیشنهادی: {thresholdPrice}</Typography>
            {cardVariant === "moderate" && (
              <Typography color="text.secondary" variant="body2">
                اختلاف جزئی است؛ توجه شود که پیشنهاد ممکن است نیاز به بررسی
                دقیق‌تر داشته باشد.
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={() =>
                handleConfirm(disc, avgPrice, thresholdPrice, action)
              }
              sx={{ marginTop: 1 }}
            >
              تایید پیشنهاد
            </Button>
          </CardContent>
        </Card>
      );
    });
  };

  // ثبت اطلاعات پیشنهاد و باز کردن فرم مودال
  const handleConfirm = (disc, avgPrice, thresholdPrice, action) => {
    setSelectedSuggestion({ ...disc, avgPrice, thresholdPrice, action });
    // در فرم، نوع عملیات طبق پیشنهاد ثابت می‌شود.
    setFormData((prev) => ({
      ...prev,
      operationType: action,
    }));
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedSuggestion(null);
    setFormData({
      operationType: "",
      amount: "",
      price: "",
      total: 0,
      counterparty: "",
      otherFirstName: "",
      otherLastName: "",
      otherMobile: "",
      otherAccountNumber: "",
    });
    setPriceError("");
  };

  // کنترل تغییرات فرم و محاسبه خودکار مجموع
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };
    if (name === "amount" || name === "price") {
      const amount = name === "amount" ? value : formData.amount;
      const price = name === "price" ? value : formData.price;
      updatedForm.total = amount && price ? amount * price : 0;
      // اعتبارسنجی قیمت با توجه به حد نسبی پیشنهادی
      if (
        selectedSuggestion &&
        parseFloat(price) < selectedSuggestion.thresholdPrice
      ) {
        setPriceError(
          `قیمت باید حداقل ${selectedSuggestion.thresholdPrice} باشد.`
        );
      } else {
        setPriceError("");
      }
    }
    setFormData(updatedForm);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // اعتبارسنجی نهایی: اگر خطای قیمت وجود دارد، از ثبت جلوگیری شود.
    if (priceError) return;

    // در صورتی که گزینه "سایر" انتخاب شده، اعتبارسنجی اطلاعات طرف معامله جدید انجام شود.
    if (formData.counterparty === "others") {
      if (
        !formData.otherFirstName ||
        !formData.otherLastName ||
        !formData.otherMobile ||
        !formData.otherAccountNumber
      ) {
        alert("لطفاً اطلاعات کامل طرف معامله جدید را وارد کنید.");
        return;
      }
    }

    // ارسال اطلاعات تراکنش به سرور یا پردازش آن در سیستم
    console.log("ثبت تراکنش:", formData);
    handleModalClose();
  };

  return (
    <Container sx={{ mt: 3, mb: 5 }}>
      <Typography variant="h5" gutterBottom>
        صفحه تیم خرید و فروش
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Typography variant="h6" gutterBottom>
        وضعیت برابری سیستم
      </Typography>
      {loading ? <CircularProgress /> : renderGaugeCharts()}
      <Typography variant="h6" sx={{ mt: 4 }}>
        پیشنهادهای سیستم
      </Typography>
      {renderSuggestionCards()}

      <Dialog
        open={modalOpen}
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تایید تراکنش {selectedSuggestion?.action}</DialogTitle>
        <DialogContent>
          <form onSubmit={handleFormSubmit} id="transaction-form">
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="operationType-label">نوع عملیات</InputLabel>
                  <Select
                    labelId="operationType-label"
                    name="operationType"
                    value={formData.operationType}
                    label="نوع عملیات"
                    disabled
                  >
                    <MenuItem value="خرید">خرید</MenuItem>
                    <MenuItem value="فروش">فروش</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="مقدار"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="قیمت"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleFormChange}
                  fullWidth
                  error={!!priceError}
                  helperText={priceError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="مجموع کل"
                  name="total"
                  type="number"
                  value={formData.total}
                  disabled
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="counterparty-label">
                    طرف معامله (همکار)
                  </InputLabel>
                  <Select
                    labelId="counterparty-label"
                    name="counterparty"
                    value={formData.counterparty}
                    label="طرف معامله (همکار)"
                    onChange={handleFormChange}
                  >
                    {colleagueList.map((colleague) => (
                      <MenuItem key={colleague.ID} value={colleague.ID}>
                        {colleague.FirstName} {colleague.LastName} - موجودی:{" "}
                        {colleague.balance || 0}
                      </MenuItem>
                    ))}
                    <MenuItem value="others">سایر (طرف معامله جدید)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {formData.counterparty === "others" && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      label="نام"
                      name="otherFirstName"
                      type="text"
                      value={formData.otherFirstName}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="نام خانوادگی"
                      name="otherLastName"
                      type="text"
                      value={formData.otherLastName}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="موبایل"
                      name="otherMobile"
                      type="text"
                      value={formData.otherMobile}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="شماره حساب/کارت"
                      name="otherAccountNumber"
                      type="text"
                      value={formData.otherAccountNumber}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>انصراف</Button>
          <Button type="submit" form="transaction-form" variant="contained">
            ثبت تراکنش
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BuySellPage;
