import React, { useState, useMemo, useEffect, useContext } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CardToIban from "components/common/jibit/CardToIban";
import IbanInquiry from "components/common/jibit/IbanInquiry";
import WithdrawalsService from "services/WithdrawalsService";
import { getUserID } from "utils/userUtils";
import AuthContext from "contexts/AuthContext"; // AuthContext را import کنید

const TabPanel = ({ children, value, index }) => {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      sx={{ width: "100%", height: "100%" }}
    >
      {value === index && <Box sx={{ p: 0.05 }}>{children}</Box>}
    </Box>
  );
};

const WithdrawPage = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [personName, setPersonName] = useState("");
  const [rialAmount, setRialAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isTableOpen, setTableOpen] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  // دریافت userInfo از کانتکست
  const { userInfo } = useContext(AuthContext);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const fetchWithdrawals = async () => {
    console.log("Fetching withdrawals...");
    try {
      const data = await WithdrawalsService.fetchWithdrawals();
      console.log("Withdrawals data received:", data);
      if (data.success) {
        setWithdrawHistory(data.data);
      } else {
        setError(data.error || "خطا در دریافت داده‌ها");
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setError("خطا در دریافت تاریخچه برداشت.");
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleWithdraw = async () => {
    console.log("Handling withdraw...");
    const user_id = getUserID(userInfo); // استخراج فقط UserID
    console.log("User ID:", user_id);

    if (!user_id) {
      console.error("User ID is missing.");
      setError("خطا در دریافت شناسه کاربر. لطفاً دوباره وارد شوید.");
      return;
    }

    if (!accountNumber || !personName || !rialAmount) {
      console.error("All fields are required.");
      setError("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    const payload = {
      UserID: user_id,
      Amount: parseFloat(rialAmount),
      CurrencyType: "ریال",
      IBAN: accountNumber,
      AccountHolderName: personName,
      WithdrawalDateTime: new Date().toISOString(),
      Status: "Pending",
      Description: "درخواست برداشت ریالی",
      CreatedBy: user_id,
    };

    console.log("Payload to be sent:", payload);

    try {
      console.log("Sending withdrawal request...");
      const response = await WithdrawalsService.createWithdrawal(payload);
      console.log("Withdrawal response:", response);

      if (response.success) {
        setSuccess("درخواست برداشت شما با موفقیت ثبت شد.");
        setError(null);
        setAccountNumber("");
        setPersonName("");
        setRialAmount("");
        fetchWithdrawals();
      } else {
        setError(response.error || "خطا در ثبت درخواست برداشت.");
        setSuccess(null);
      }
    } catch (err) {
      console.error("Error in withdrawal request:", err);
      setError("خطا در ثبت درخواست برداشت. لطفاً مجدد تلاش کنید.");
      setSuccess(null);
    }
  };

  const columns = useMemo(
    () => ["شناسه", "کاربر", "مقدار", "نوع ارز", "وضعیت", "تاریخ"],
    []
  );

  return (
    <Box sx={{ padding: 4, backgroundColor: theme.palette.background.default }}>
      <Typography variant="h4" textAlign="center" mb={4}>
        صفحه برداشت
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* فرم برداشت */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              boxShadow: 6,
              borderRadius: 2,
              height: 400,
              backgroundColor: "#373B44",
              color: "white",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <CardHeader
              title="فرم برداشت"
              sx={{
                textAlign: "center",
                color: "#FFD700",
                fontWeight: "bold",
                fontSize: "1.5rem",
                borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                paddingBottom: 2,
              }}
            />
            <CardContent
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                gap: 3,
                justifyContent: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  fullWidth
                  label="شماره شبا"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  InputLabelProps={{
                    style: { color: "white" },
                  }}
                  sx={{
                    backgroundColor: "#50597b",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      color: "white",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFD700",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFC300",
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  fullWidth
                  label="نام صاحب حساب"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  InputLabelProps={{
                    style: { color: "white" },
                  }}
                  sx={{
                    backgroundColor: "#50597b",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      color: "white",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFD700",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFC300",
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                  fullWidth
                  label="مقدار درخواست برداشت"
                  type="number"
                  value={rialAmount}
                  onChange={(e) => setRialAmount(e.target.value)}
                  InputLabelProps={{
                    style: { color: "white" },
                  }}
                  sx={{
                    backgroundColor: "#50597b",
                    borderRadius: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      color: "white",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFD700",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#FFC300",
                    },
                  }}
                />
              </Box>
              <Button
                fullWidth
                variant="contained"
                sx={{
                  fontWeight: "bold",
                  backgroundColor: "#FFD700",
                  color: "#373B44",
                  fontSize: "1rem",
                  borderRadius: 2,
                  paddingY: 1.5,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#FFC300",
                    transform: "scale(1.05)",
                  },
                }}
                onClick={handleWithdraw}
              >
                تأیید برداشت
              </Button>
              {error && (
                <Typography color="error" mt={2}>
                  {error}
                </Typography>
              )}
              {success && (
                <Typography sx={{ color: "#4caf50", mt: 2 }}>
                  {success}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* استعلام شماره کارت/شبا */}
        <Grid item xs={12} sm={6}>
          <Card
            sx={{
              boxShadow: 6,
              borderRadius: 2,
              height: 400,
              backgroundColor: "#373B44",
              color: "white",
            }}
          >
            <CardHeader
              title="استعلام شماره کارت/شبا"
              sx={{
                textAlign: "center",
                color: "#FFD700",
                fontWeight: "bold",
                fontSize: "1.5rem",
                borderBottom: "2px solid rgba(255, 255, 255, 0.2)",
                paddingBottom: 2,
              }}
            />
            <CardContent>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                indicatorColor="secondary"
                textColor="inherit"
                variant="fullWidth"
                sx={{
                  backgroundColor: "#50597b",
                  borderRadius: 1,
                  mb: 2,
                  "& .MuiTab-root": {
                    color: "white",
                    fontWeight: "bold",
                  },
                  "& .Mui-selected": {
                    color: "#FFD700",
                  },
                }}
              >
                <Tab label="کارت به شبا" />
                <Tab label="استعلام شبا" />
              </Tabs>

              {/* نمایش تب‌ها */}
              <TabPanel value={tabValue} index={0}>
                <CardToIban
                  title="Card to IBAN Inquiry"
                  buttonText="Convert"
                  cardPlaceholder="Enter your 16-digit card number"
                  width="100%"
                  height="auto"
                  sx={{
                    backgroundColor: "#50597b",
                    padding: 0.5,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  }}
                />
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <IbanInquiry
                  title="IBAN Inquiry"
                  buttonText="Check Now"
                  ibanPlaceholder="Enter your IBAN without IR"
                  width="100%"
                  height="50"
                  sx={{
                    backgroundColor: "#50597b",
                    padding: 0.5,
                    borderRadius: 2,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                  }}
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Accordion
        expanded={isTableOpen}
        onChange={() => setTableOpen(!isTableOpen)}
        sx={{ mt: 4 }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ backgroundColor: theme.palette.grey[200] }}
        >
          <Typography variant="h6">تاریخچه برداشت‌ها</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col} align="center">
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {withdrawHistory.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell align="center">{row.WithdrawalID}</TableCell>
                    <TableCell align="center">{row.UserID}</TableCell>
                    <TableCell align="center">{row.Amount}</TableCell>
                    <TableCell align="center">{row.CurrencyType}</TableCell>
                    <TableCell align="center">{row.Status}</TableCell>
                    <TableCell align="center">
                      {new Date(row.WithdrawalDateTime).toLocaleString("fa-IR")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default WithdrawPage;
