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
import TransactionTable from "components/tables/TransactionTable";

const AutomaticTransaction = () => {
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("buy");
  const [transactions, setTransactions] = useState([]);

  const theme = useTheme();

  const { userInfo } = useContext(AuthContext);
  const getCurrentUserID = userInfo?.UserID;
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const data = await ApiManager.TransactionsService.fetchPrice(currency);
        setPrice(data.price);
      } catch (error) {
        setPrice(null);
      }
    };
    fetchPrice();
  }, [currency]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await ApiManager.TransactionsService.fetchTransactions();
        setTransactions(
          data.map((transaction, index) => ({
            id: transaction.TransactionID || index, // استفاده از TransactionID به عنوان id یا مقدار یکتا
            date: new Date(transaction.TransactionDateTime).toLocaleString(
              "fa-IR"
            ),
            type: transaction.TransactionType,
            currency: transaction.CurrencyType,
            price: transaction.Price,
            quantity: transaction.Quantity,
            total: transaction.Quantity * transaction.Price,
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
      UserID: userInfo?.user_id || 1,
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: "Automatic",
      Position: transactionType === "buy" ? "Buy" : "Sell",
      CurrencyType: currency,
      CreatedBy: getCurrentUserID,
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
      {/* فرم ثبت معامله */}
      <Grid item xs={12} md={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            backgroundColor: theme.palette.background.paper,
            height: "100%",
          }}
        >
          <Typography
            variant="h5"
            gutterBottom
            color={theme.palette.text.primary}
          >
            ثبت معامله جدید
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel>نوع معامله</InputLabel>
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
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
            />

            <TextField
              label="قیمت (از API)"
              fullWidth
              margin="normal"
              value={price || "در حال بارگذاری..."}
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="مجموع"
              fullWidth
              margin="normal"
              value={total || "در حال محاسبه..."}
              InputProps={{ readOnly: true }}
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
              transactions={transactions}
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

export default AutomaticTransaction;
