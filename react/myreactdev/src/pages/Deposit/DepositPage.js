import React, { useState, useMemo, useContext } from "react";
import { QRCodeCanvas } from "qrcode.react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Paper,
  IconButton,
  useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdvancedTable from "components/tables/AdvancedTable";
import AuthContext from "contexts/AuthContext";

const mockDepositHistory = [
  { id: 1, type: "تتر", amount: 500, date: "2024-12-01" },
  { id: 2, type: "ریال", amount: 2000000, date: "2024-12-01" },
  { id: 3, type: "تتر", amount: 300, date: "2024-12-02" },
  { id: 4, type: "ریال", amount: 1000000, date: "2024-12-02" },
];

const DepositPage = () => {
  const theme = useTheme();
  const [usdtAddress] = useState("0x1234567890abcdef1234567890abcdef12345678");
  const [rialAmount, setRialAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [isTableOpen, setTableOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { userInfo } = useContext(AuthContext);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("آدرس کپی شد!");
  };

  // تعریف ستون‌های AdvancedTable به صورت useMemo
  const columns = useMemo(
    () => [
      { field: "id", label: "شناسه" },
      { field: "type", label: "نوع واریز" },
      { field: "amount", label: "مقدار" },
      { field: "date", label: "تاریخ" },
    ],
    []
  );

  // تابع واکشی داده (در این مثال از داده‌های نمونه استفاده می‌شود)
  const fetchData = async () => {
    // در یک برنامه واقعی این تابع می‌تواند از API فراخوانی کند.
    return mockDepositHistory;
  };

  // تابع تعیین رنگ پس‌زمینه ردیف‌ها بر اساس نوع واریز
  const getRowBgColor = (type) => {
    if (type === "تتر") return "#e0f7fa"; // آبی روشن
    if (type === "ریال") return "#fce4ec"; // صورتی روشن
    return "#ffffff";
  };

  return (
    <Box
      sx={{
        padding: 4,
        backgroundColor: theme.palette.background.default,
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          textAlign: "center",
          mb: 4,
          fontWeight: "bold",
          color: theme.palette.primary.main,
        }}
      >
        صفحه واریز
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* USDT Deposit Box */}
        <Grid item xs={12} sm={6} md={5}>
          <Card
            sx={{
              boxShadow: 6,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              height: 400,
            }}
          >
            <CardHeader
              title="واریز تتر"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.5rem",
                borderBottom: `2px solid ${theme.palette.divider}`,
                paddingBottom: 2,
              }}
            />
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                alignItems: "center",
              }}
            >
              <Typography variant="body1" fontWeight="bold">
                آدرس کیف پول:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: theme.palette.grey[600],
                  padding: 1,
                  borderRadius: 1,
                  wordBreak: "break-all",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.primary }}
                >
                  {usdtAddress}
                </Typography>
                <IconButton onClick={() => copyToClipboard(usdtAddress)}>
                  <ContentCopyIcon />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <QRCodeCanvas value={usdtAddress} size={120} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Rial Deposit Box */}
        <Grid item xs={12} sm={6} md={5}>
          <Card
            sx={{
              boxShadow: 6,
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              height: 400,
            }}
          >
            <CardHeader
              title="واریز ریال"
              sx={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "1.5rem",
                borderBottom: `2px solid ${theme.palette.divider}`,
                paddingBottom: 2,
              }}
            />
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <TextField
                fullWidth
                label="مقدار"
                type="number"
                value={rialAmount}
                onChange={(e) => setRialAmount(e.target.value)}
              />
              <TextField
                fullWidth
                label="نام بانک"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <Button fullWidth variant="contained" color="primary">
                واریز ریال
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deposit History */}
      <Box sx={{ mt: 6 }}>
        <Box
          onClick={() => setTableOpen(!isTableOpen)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            تاریخچه واریز
          </Typography>
          <ExpandMoreIcon
            sx={{
              ml: 1,
              transform: isTableOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          />
        </Box>
        {isTableOpen && (
          <AdvancedTable
            key={refreshKey}
            columns={columns}
            fetchData={fetchData}
            defaultPageSize={10}
            getCardBgColor={(row) => getRowBgColor(row.type)}
          />
        )}
      </Box>
    </Box>
  );
};

export default DepositPage;
