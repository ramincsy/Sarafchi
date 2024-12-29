import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import TransactionTable from "components/tables/TransactionTable";
import WithdrawalsTable from "components/tables/WithdrawalsTable";
import PriceBox from "components/common/PriceBox";
import ApiManager from "services/ApiManager";

const StatCard = ({ title, value }) => {
  const theme = useTheme();

  const cardStyles = useMemo(
    () => ({
      card: {
        textAlign: "center",
        borderRadius: theme.shape.borderRadius * 2,
        boxShadow: theme.shadows[4],
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
        p: { xs: 1, sm: 1.5 },
        minWidth: { xs: 70, sm: 100 },
        transition: theme.transitions.create(["transform", "box-shadow"], {
          duration: theme.transitions.duration.shorter,
        }),
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[8],
        },
      },
      title: {
        color: theme.palette.primary.contrastText,
        fontSize: { xs: 10, sm: 12 },
        fontWeight: theme.typography.fontWeightBold,
        opacity: 0.9,
      },
      value: {
        color: theme.palette.primary.contrastText,
        fontSize: { xs: 16, sm: 20 },
        fontWeight: theme.typography.fontWeightBold,
        mt: 1,
      },
    }),
    [theme]
  );

  return (
    <Card elevation={4} sx={cardStyles.card}>
      <CardContent>
        <Typography variant="subtitle2" sx={cardStyles.title}>
          {title}
        </Typography>
        <Typography variant="h6" sx={cardStyles.value}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [transactionStats, setTransactionStats] = useState({
    suggestedTransactions: 0,
    onlineTransactions: 0,
    automaticTransactions: 0,
    totalTransactions: 0,
  });

  const styles = useMemo(
    () => ({
      root: {
        p: { xs: 2, md: 4 },
        backgroundColor: theme.palette.background.default,
      },
      accordion: {
        backgroundColor: theme.palette.background.paper,
        "& .MuiAccordionSummary-root": {
          backgroundColor: theme.palette.background.default,
        },
      },
      accordionTitle: {
        fontSize: { xs: 14, sm: 20 },
        color: theme.palette.text.primary,
      },
      paper: {
        height: "400px",
        overflowY: "auto",
        p: 2,
        borderRadius: theme.shape.borderRadius * 2,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[4],
      },
      gridContainer: {
        mb: 2,
      },
    }),
    [theme]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await ApiManager.TransactionsService.fetchTransactions();
        setTransactionStats({
          suggestedTransactions: data.filter(
            (tx) => tx.TransactionType === "معامله پيشنهادي"
          ).length,
          onlineTransactions: data.filter(
            (tx) => tx.TransactionType === "معامله روي خط"
          ).length,
          automaticTransactions: data.filter(
            (tx) => tx.TransactionType === "معامله اتوماتيک"
          ).length,
          totalTransactions: data.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={styles.root}>
      {/* Top Statistics */}
      <Grid container spacing={2} sx={styles.gridContainer}>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="تعداد تراکنش‌های پیشنهادی"
            value={transactionStats.suggestedTransactions}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="تعداد تراکنش‌های روی خط"
            value={transactionStats.onlineTransactions}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="تعداد تراکنش‌های اتوماتیک"
            value={transactionStats.automaticTransactions}
          />
        </Grid>
        <Grid item xs={6} sm={6} md={3}>
          <StatCard
            title="تعداد کل تراکنش‌ها"
            value={transactionStats.totalTransactions}
          />
        </Grid>
      </Grid>

      {/* Price Boxes */}
      <Grid container spacing={2} sx={styles.gridContainer}>
        <Grid item xs={12} md={6}>
          <PriceBox
            refreshInterval={300000}
            showBuyPrice={true}
            showSellPrice={false}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PriceBox
            refreshInterval={300000}
            showBuyPrice={false}
            showSellPrice={true}
          />
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={2}>
        {/* Left Column */}
        <Grid item xs={12} md={4}>
          <Accordion sx={styles.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6" sx={styles.accordionTitle}>
                برداشت‌ها
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={styles.paper}>
                <WithdrawalsTable
                  showApproveButton={true}
                  showRejectButton={true}
                  showTitle={false}
                  showSearchBox={false}
                  visibleColumns={["user", "status", "actions"]}
                />
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={8}>
          <Accordion sx={styles.accordion}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography variant="h6" sx={styles.accordionTitle}>
                جدول تراکنش‌ها
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={styles.paper}>
                <TransactionTable
                  title="جدول تراکنش‌ها برای مدیر"
                  role="manager"
                  showApproveButton={true}
                  showRejectButton={true}
                  visibleColumns={["id", "user", "price", "status", "actions"]}
                />
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
    </Box>
  );
}
