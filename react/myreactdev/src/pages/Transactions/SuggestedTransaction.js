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
import ApiManager from "services/ApiManager";
import TransactionTable from "components/tables/TransactionTable"; // مسیر کامپوننت جدول را بررسی کنید

const SuggestedTransaction = () => {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("buy");
  const [transactions, setTransactions] = useState([]);
  const { userInfo } = useContext(AuthContext);
  const theme = useTheme();

  const getCurrentUserID = () => userInfo?.user_id || "System";

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await ApiManager.TransactionsService.fetchTransactions();
        setTransactions(
          data.map((transaction, index) => ({
            id: transaction.TransactionID || index,
            date: new Date(transaction.TransactionDateTime).toLocaleString(
              "fa-IR"
            ),
            userID: transaction.UserID,
            createdBy: transaction.CreatedBy,
            quantity: transaction.Quantity,
            price: transaction.Price,
            total: transaction.Quantity * transaction.Price,
            type: transaction.TransactionType,
            status: transaction.Status,
            currency: transaction.CurrencyType,
          }))
        );
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    fetchTransactions();
  }, []);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    setTotal(price && value ? value * price : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionData = {
      UserID: getCurrentUserID(),
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: "Suggested",
      Position: transactionType === "buy" ? "Buy" : "Sell",
      CurrencyType: currency,
      CreatedBy: getCurrentUserID(),
    };

    try {
      await ApiManager.TransactionsService.createTransaction(transactionData);
      alert("تراکنش با موفقیت ثبت شد");
      setQuantity("");
      setTotal(null);
      setTransactions((prev) => [
        ...prev,
        { ...transactionData, id: prev.length + 1 },
      ]);
    } catch (error) {
      alert("خطا در ثبت تراکنش");
    }
  };

  return (
    <Grid container spacing={3} padding={3}>
      {/* فرم ثبت معامله پیشنهادی */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            borderRadius: 2,
            height: "calc(100vh - 300px)", // ارتفاع هماهنگ با Accordion
          }}
        >
          <Typography variant="h5" gutterBottom>
            ثبت معامله پیشنهادی
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
              type="number"
              fullWidth
              margin="normal"
              value={price || "در حال بارگذاری..."}
              onChange={(e) => setPrice(e.target.value)}
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

      {/* جدول سمت راست */}
      <Grid item xs={12} md={8}>
        <Accordion defaultExpanded sx={{ height: "calc(100vh - 300px)" }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">تاریخچه معاملات</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              height: "calc(100vh - 400px)",
              overflow: "hidden",
            }}
          >
            <TransactionTable
              role="manager"
              showApproveButton={true}
              showRejectButton={true}
              visibleColumns={[
                "user",
                "type",
                "currency",
                "quantity",
                "price",
                "total",
                "date",
                "status",
                "actions",
              ]}
            />
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>
  );
};

export default SuggestedTransaction;
