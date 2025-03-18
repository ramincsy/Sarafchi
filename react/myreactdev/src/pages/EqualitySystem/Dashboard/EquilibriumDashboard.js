import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Stack,
  Divider,
  useTheme,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Autorenew,
  Equalizer,
  MonetizationOn,
  AutoFixHigh,
} from "@mui/icons-material";
import CircularTimer from "./CircularTimer";
import EquilibriumService from "services/EquilibriumService";
import GaugeCharts from "./GaugeCharts";
import ConfirmProposalWizard from "./ConfirmProposalWizard";
import { getUserID } from "utils/userUtils";
// کامپوننت جدیدی که برای مدیریت پیشنهادها ساختیم
import ProposalsSection from "./ProposalsSection";

const EquilibriumDashboard = () => {
  const theme = useTheme();

  const [userTotals, setUserTotals] = useState({});
  const [companyTotals, setCompanyTotals] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  // جدا کردن پیشنهادها به دو دسته
  const [existingSuggestions, setExistingSuggestions] = useState([]);
  const [newSuggestions, setNewSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [receipts, setReceipts] = useState([]);

  // برای غیرفعال‌کردن دکمهٔ تأیید پس از کلیک
  const [approvingProposals, setApprovingProposals] = useState([]);

  const extractedTraderID = getUserID();
  console.log(extractedTraderID);
  if (!extractedTraderID) {
    console.error(
      "TraderID could not be extracted. Please check token validity."
    );
  } else {
    console.log("Extracted TraderID:", extractedTraderID);
  }

  // متد اصلی برای گرفتن داده از سرور
  const fetchData = async () => {
    setLoading(true);
    try {
      const [ut, ct, sug, trans] = await Promise.all([
        EquilibriumService.fetchUserBalances(),
        EquilibriumService.fetchCompanyBalances(),
        EquilibriumService.fetchSuggestions(),
        EquilibriumService.listTransactions(),
      ]);

      setUserTotals(ut);
      setCompanyTotals(ct);

      // پیشنهادها را به موجود و جدید تقسیم می‌کنیم
      const existing = sug.filter((item) => item.ProposalID != null);
      const newly = sug.filter((item) => !item.ProposalID);

      setExistingSuggestions(existing);
      setNewSuggestions(newly);

      setSuggestions(sug);
      setTransactions(trans);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // محاسبه اختلاف موجودی برای نمودار گیج
  const computeDiscrepancies = () => {
    const currencies = Object.keys({ ...userTotals, ...companyTotals });
    return currencies.map((currency) => {
      const userBalance = userTotals[currency]?.balance || 0;
      const companyBalance = companyTotals[currency]?.balance || 0;
      const difference = Math.abs(companyBalance - userBalance);
      return {
        currency,
        user_balance: userBalance,
        company_balance: companyBalance,
        difference,
      };
    });
  };

  // وقتی کاربر روی دکمهٔ تأیید (Approve) کلیک می‌کند
  const handleApproveProposal = (proposal) => {
    setSelectedProposal(proposal);
    // این معرف آن است که این ProposalID در حال تأیید است
    setApprovingProposals((prev) => [...prev, proposal.ProposalID]);
    setWizardOpen(true);
  };

  // برای مشاهده لیست فیش‌های یک تراکنش
  const handleTransactionClick = async (trans) => {
    setSelectedTransactionId(trans.TransactionID);
    try {
      const res = await EquilibriumService.listReceipts(trans.TransactionID);
      setReceipts(res);
    } catch (error) {
      console.error("Error fetching receipts:", error);
    }
  };

  // رندر کارت موجودی‌ها (فقط یک تابع کمکی)
  const renderTotals = (totals, title) => {
    return (
      <Card sx={{ boxShadow: theme.shadows[4] }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Grid container spacing={2}>
            {Object.entries(totals).map(([currency, data]) => (
              <Grid item xs={12} md={6} key={currency}>
                <Card variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <MonetizationOn color="primary" />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {currency}
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={1}>
                      {Object.entries(data).map(([key, value]) => (
                        <Grid item xs={6} key={key}>
                          <Typography variant="body2" color="text.secondary">
                            {key.replace(/_/g, " ")}:
                          </Typography>
                          <Typography variant="body1" fontWeight="medium">
                            {value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: theme.palette.grey[50] }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        spacing={2}
      >
        <Typography variant="h4" fontWeight="bold" color="primary">
          Equilibrium Dashboard
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Autorenew />}
            onClick={fetchData}
            sx={{ borderRadius: 50 }}
          >
            Refresh Data
          </Button>
          <Button
            variant="outlined"
            startIcon={<AutoFixHigh />}
            onClick={async () => {
              try {
                await EquilibriumService.autoCreateProposals();
                fetchData();
              } catch (error) {
                console.error("Error auto creating proposals:", error);
              }
            }}
            sx={{ borderRadius: 50 }}
          >
            Auto Proposals
          </Button>
        </Stack>
      </Stack>

      {/* نمایش صفحه در صورت آماده بودن داده‌ها یا اسپیتر در حال بارگذاری */}
      {loading ? (
        <Box
          sx={{
            height: "50vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" mt={2} color="text.secondary">
            Loading data...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {/* موجودی‌های تجمیعی کاربران */}
          <Grid item xs={12} md={6}>
            {renderTotals(userTotals, "User Aggregated Balances")}
          </Grid>
          {/* موجودی‌های تجمیعی شرکت */}
          <Grid item xs={12} md={6}>
            {renderTotals(companyTotals, "Company Aggregated Balances")}
          </Grid>

          {/* نمودار گِیج اختلاف موجودی */}
          <Grid item xs={12}>
            <Card sx={{ boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  <Equalizer fontSize="large" color="primary" />
                  <Typography variant="h5" fontWeight="medium">
                    Balance Discrepancy Analysis
                  </Typography>
                </Stack>
                <GaugeCharts discrepancies={computeDiscrepancies()} />
              </CardContent>
            </Card>
          </Grid>

          {/* اینجا از کامپوننت مجزای ProposalsSection استفاده می‌کنیم */}
          <Grid item xs={12}>
            <ProposalsSection
              existingSuggestions={existingSuggestions}
              newSuggestions={newSuggestions}
              approvingProposals={approvingProposals}
              onApproveProposal={handleApproveProposal}
              onRefreshData={fetchData} // برای ریفرش مجدد داده
            />
          </Grid>

          {/* لیست تراکنش‌ها */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: theme.shadows[4] }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Transactions
                </Typography>
                {transactions.length > 0 ? (
                  <List>
                    {transactions.map((trans) => (
                      <ListItem
                        key={trans.TransactionID}
                        button
                        onClick={() => handleTransactionClick(trans)}
                      >
                        <ListItemText
                          primary={`Trans ID: ${trans.TransactionID} | ${trans.Currency} | Amount: ${trans.Amount}`}
                          secondary={`Status: ${trans.Status}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography>No transactions available.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* لیست فیش‌های تراکنش انتخاب‌شده */}
          {selectedTransactionId && (
            <Grid item xs={12} md={6}>
              <Card sx={{ boxShadow: theme.shadows[4] }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Receipts for Transaction ID: {selectedTransactionId}
                  </Typography>
                  {receipts.length > 0 ? (
                    <List>
                      {receipts.map((rec) => (
                        <ListItem key={rec.ReceiptID}>
                          <ListItemText
                            primary={`File: ${rec.FilePath}`}
                            secondary={`Type: ${rec.FileType} | Uploaded: ${rec.UploadedAt}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography>No receipts available.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* مودال تایید پیشنهاد (ویزارد) */}
      {wizardOpen && selectedProposal && (
        <ConfirmProposalWizard
          open={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setSelectedProposal(null);
            fetchData();
          }}
          proposal={selectedProposal}
          // مثلا کاربر با شناسه 123. در پروژه واقعی از سیستم احراز هویت گرفته می‌شود
          resumeStep={0}
          onComplete={async (wizardData) => {
            try {
              // پیشنهاد را تایید می‌کنیم
              await EquilibriumService.approveProposal(
                selectedProposal.ProposalID,
                {
                  ConfirmedBy: extractedTraderID,
                }
              );
              // ثبت تراکنش
              await EquilibriumService.createTransaction(
                wizardData.transactionInfo
              );
              // آپلود فیش‌ها
              await EquilibriumService.uploadReceipt({
                TransactionID: wizardData.transactionInfo.ProposalID,
                FilePath: wizardData.receiptsInfo.TomanReceipt,
                FileType: "image",
                Description: "Toman receipt",
              });
              await EquilibriumService.uploadReceipt({
                TransactionID: wizardData.transactionInfo.ProposalID,
                FilePath: wizardData.receiptsInfo.USDTReceipt,
                FileType: "image",
                Description: "USDT receipt",
              });
              console.log("Final remarks:", wizardData.finalRemarks);
            } catch (error) {
              console.error("Error finalizing proposal:", error);
            }
          }}
        />
      )}
    </Box>
  );
};

export default EquilibriumDashboard;
