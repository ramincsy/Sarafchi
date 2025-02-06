import React, { useState, useEffect, useContext } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AuthContext from "contexts/AuthContext";
import TransactionService from "services/TransactionService";
import AdvancedTable from "components/tables/AdvancedTable";

const LiveTransaction = () => {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("buy");
  const [refreshKey, setRefreshKey] = useState(0); // برای رفرش مجدد جدول پس از تغییرات
  const theme = useTheme();
  const { userInfo } = useContext(AuthContext);
  const getCurrentUserID = userInfo?.UserID;

  // واکشی قیمت زنده (هر 5 ثانیه)
  useEffect(() => {
    const fetchLivePrice = async () => {
      try {
        const data = await TransactionService.fetchPrice(currency);
        setPrice(data.price);
      } catch (error) {
        console.error("Error fetching price:", error);
        setPrice(null);
      }
    };

    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 5000);
    return () => clearInterval(interval);
  }, [currency]);

  // تابع واکشی داده برای AdvancedTable
  const fetchData = async () => {
    try {
      const data = await TransactionService.fetchTransactions();
      return data.map((transaction, index) => ({
        id: transaction.TransactionID || index, // شناسه تراکنش به عنوان id
        date: new Date(transaction.TransactionDateTime).toLocaleString("fa-IR"),
        userID: transaction.UserID,
        createdBy: transaction.CreatedBy,
        quantity: transaction.Quantity,
        price: transaction.Price,
        total: transaction.Quantity * transaction.Price,
        type: transaction.TransactionType,
        Status: transaction.Status, // وضعیت تراکنش
        currency: transaction.CurrencyType,
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  // ستون‌های جدول AdvancedTable
  const columns = [
    { field: "id", label: "شناسه" },
    { field: "userID", label: "کاربر" },
    { field: "type", label: "نوع معامله" },
    { field: "currency", label: "ارز" },
    { field: "quantity", label: "تعداد" },
    { field: "price", label: "قیمت" },
    { field: "total", label: "مجموع" },
    { field: "date", label: "تاریخ" },
    { field: "Status", label: "وضعیت" },
  ];

  // توابع مربوط به تغییر وضعیت تراکنش
  const confirmTransaction = async (row) => {
    try {
      // فراخوانی updateTransactionStatus با عمل "confirm"
      await TransactionService.updateTransactionStatus(row.id, "confirm");
      alert("تراکنش تایید شد");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      alert("خطا در تایید تراکنش: " + error.message);
    }
  };

  const cancelTransaction = async (row) => {
    try {
      await TransactionService.updateTransactionStatus(row.id, "cancel");
      alert("تراکنش لغو شد");
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      alert("خطا در لغو تراکنش: " + error.message);
    }
  };

  // دکمه‌های عملیاتی برای هر ردیف
  const actions = (row) => (
    <>
      <Button
        variant="contained"
        color="success"
        onClick={() => confirmTransaction(row)}
        sx={{ mr: 1 }}
      >
        تایید
      </Button>
      <Button
        variant="contained"
        color="error"
        onClick={() => cancelTransaction(row)}
      >
        لغو
      </Button>
    </>
  );

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (price && value) {
      setTotal(value * price);
    } else {
      setTotal(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionData = {
      UserID: getCurrentUserID,
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: "Live",
      Position: transactionType === "buy" ? "Buy" : "Sell",
      CurrencyType: currency,
      CreatedBy: getCurrentUserID,
    };

    try {
      await TransactionService.createTransaction(transactionData);
      alert("تراکنش با موفقیت ثبت شد");
      setQuantity("");
      setTotal(null);
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      alert("خطا در ثبت تراکنش: " + error.message);
    }
  };

  return (
    <Grid container spacing={3} padding={3}>
      {/* فرم ثبت معامله */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 2,
            height: "calc(100vh - 300px)",
          }}
        >
          <Typography variant="h5" gutterBottom>
            ثبت معامله جدید
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>نوع معامله</InputLabel>
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                sx={{ backgroundColor: theme.palette.background.default }}
              >
                <MenuItem value="buy">خرید</MenuItem>
                <MenuItem value="sell">فروش</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>نوع ارز</InputLabel>
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                sx={{ backgroundColor: theme.palette.background.default }}
              >
                <MenuItem value="USD">دلار</MenuItem>
                <MenuItem value="USDT">تتر</MenuItem>
                <MenuItem value="CNY">یوان</MenuItem>
                <MenuItem value="TRY">لیر</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="تعداد"
              type="number"
              fullWidth
              margin="normal"
              value={quantity}
              onChange={handleQuantityChange}
              disabled={!price}
              sx={{ backgroundColor: theme.palette.background.default }}
            />
            <TextField
              label="قیمت"
              fullWidth
              margin="normal"
              value={price || "در حال بارگذاری..."}
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: theme.palette.background.default }}
            />
            <TextField
              label="مجموع"
              fullWidth
              margin="normal"
              value={total || "در حال محاسبه..."}
              InputProps={{ readOnly: true }}
              sx={{ backgroundColor: theme.palette.background.default }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
            >
              ثبت معامله
            </Button>
          </form>
        </Paper>
      </Grid>
      {/* جدول تاریخچه معاملات */}
      <Grid item xs={12} md={8}>
        <Accordion defaultExpanded sx={{ height: "calc(100vh - 300px)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">تاریخچه معاملات</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              height: "calc(100vh - 400px)",
              overflowY: "auto",
            }}
          >
            <AdvancedTable
              key={refreshKey} // تغییر key باعث re-mount و واکشی مجدد داده‌ها می‌شود
              columns={columns}
              fetchData={fetchData}
              actions={actions}
              defaultPageSize={10}
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default LiveTransaction;
