import React, { useState, useMemo } from "react";
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
  useMediaQuery,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useTable, useGlobalFilter } from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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

  const handleRialDeposit = () => {
    alert("اطلاعات واریز ثبت شد. به لینک بعدی متصل خواهید شد.");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("آدرس کپی شد!");
  };

  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "id" },
      { Header: "نوع واریز", accessor: "type" },
      { Header: "مقدار", accessor: "amount" },
      { Header: "تاریخ", accessor: "date" },
    ],
    []
  );

  const data = useMemo(() => mockDepositHistory, []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable({ columns, data }, useGlobalFilter);

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
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={handleRialDeposit}
              >
                واریز
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Deposit History */}
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          onClick={() => setTableOpen(!isTableOpen)}
          sx={{
            cursor: "pointer",
            textAlign: "center",
            mb: 2,
            fontWeight: "bold",
          }}
        >
          تاریخچه واریز
          <Box component="span" sx={{ ml: 1 }}>
            {isTableOpen ? <FaChevronUp /> : <FaChevronDown />}
          </Box>
        </Typography>
        {isTableOpen && (
          <Box>
            <TextField
              fullWidth
              placeholder="جستجو..."
              onChange={(e) => setGlobalFilter(e.target.value)}
              sx={{ mb: 3 }}
            />
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
              <Table {...getTableProps()}>
                <TableHead>
                  {headerGroups.map((headerGroup) => (
                    <TableRow {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <TableCell {...column.getHeaderProps()}>
                          {column.render("Header")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableHead>
                <TableBody {...getTableBodyProps()}>
                  {rows.map((row) => {
                    prepareRow(row);
                    return (
                      <TableRow {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <TableCell {...cell.getCellProps()}>
                            {cell.render("Cell")}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DepositPage;
