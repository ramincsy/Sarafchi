// ProposalsSection.js
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  List,
  Divider,
  Chip,
  LinearProgress,
  Paper,
  useTheme,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Grid,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  AutoAwesomeMotion,
  Cached,
  FilterList,
  MonetizationOn,
  Person,
  Description,
  Check,
  Schedule,
  Warning,
  CheckCircle,
} from "@mui/icons-material";

import { format } from "date-fns";
import EquilibriumService from "services/EquilibriumService";
import CircularTimer from "./CircularTimer";
import ConfirmProposalWizard from "./ConfirmProposalWizard";
import { AccessTime } from "@mui/icons-material";
import { getUserID } from "utils/userUtils";
const steps = [
  "نمایش پیشنهاد",
  "اطلاعات معامله",
  "آپلود فیش‌ها",
  "توضیحات نهایی",
];
// کامپوننت تایمر: زمان باقی‌مانده تا انقضا
const ProposalTimer = ({ expirationTime }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const exp = new Date(expirationTime);
      const diff = exp - now;
      if (diff <= 0) {
        setTimeLeft("Expired");
      } else {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
      }
    };

    updateTime();
    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [expirationTime]);

  return (
    <Typography variant="body2" color="text.secondary">
      Time left: {timeLeft}
    </Typography>
  );
};

// کامپوننت نمایش یک کارت پیشنهاد
function ProposalCard({
  proposal,
  onRefreshData,
  onCompleteWizard,
  traderID,
  setAllProposals,
}) {
  const theme = useTheme();
  const [isApproving, setIsApproving] = useState(false);

  const isBuyAction = proposal.ProposalType?.toLowerCase().includes("buy");
  const statusColorMap = {
    Pending: "warning",
    Confirmed: "success",
    Expired: "error",
    Completed: "info",
  };

  const handleComplete = async () => {
    setIsApproving(true);
    try {
      // تایید پیشنهاد قبل از باز کردن مودال
      await EquilibriumService.approveProposal(proposal.ProposalID, {
        ConfirmedBy: traderID,
      });

      // تغییر وضعیت پیشنهاد به "Confirmed"
      setAllProposals((prevProposals) =>
        prevProposals.map((p) =>
          p.ProposalID === proposal.ProposalID
            ? { ...p, Status: "Confirmed" }
            : p
        )
      );

      // باز کردن مودال پس از تایید موفق
      onCompleteWizard(proposal);
    } catch (error) {
      console.error("Error approving proposal:", error);
      alert(`تایید پیشنهاد ناموفق بود: ${error.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd MMM yyyy, HH:mm");
  };

  return (
    <Paper
      elevation={2}
      sx={{
        mb: 3,
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        borderLeft: `4px solid ${
          isBuyAction ? theme.palette.success.main : theme.palette.error.main
        }`,
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: theme.shadows[4],
        },
        transition: "all 0.3s ease",
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header Section */}
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Avatar
              sx={{
                bgcolor: isBuyAction
                  ? theme.palette.success.light
                  : theme.palette.error.light,
              }}
            >
              {isBuyAction ? (
                <Check fontSize="small" />
              ) : (
                <Warning fontSize="small" />
              )}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                {proposal.Currency} {isBuyAction ? "Buy" : "Sell"} Order
              </Typography>
              <Chip
                label={proposal.Status}
                color={statusColorMap[proposal.Status]}
                size="small"
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Proposal ID: #{proposal.ProposalID}
            </Typography>
          </Grid>
          <Grid item>
            {proposal.ExpirationTime && (
              <Tooltip title="Expiration Time">
                <Chip
                  icon={<Schedule fontSize="small" />}
                  label={
                    <CircularTimer expirationTime={proposal.ExpirationTime} />
                  }
                  variant="outlined"
                  size="small"
                />
              </Tooltip>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Financial Details */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Financial Details
              </Typography>
              <DetailItem
                icon={<MonetizationOn fontSize="small" />}
                label="Amount"
                value={proposal.Amount}
                unit={proposal.Currency}
              />
              <DetailItem
                icon={<MonetizationOn fontSize="small" />}
                label="Price"
                value={proposal.Price}
                unit="TOMAN"
              />
              <DetailItem
                icon={<MonetizationOn fontSize="small" />}
                label="Total Value"
                value={proposal.TotalValue}
                unit="TOMAN"
              />
              <DetailItem
                icon={<MonetizationOn fontSize="small" />}
                label="Reserved"
                value={proposal.ReservedAmount}
                unit={proposal.Currency}
              />
            </Stack>
          </Grid>

          {/* Timeline Details */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Timeline
              </Typography>
              <DetailItem
                icon={<AccessTime fontSize="small" />}
                label="Created At"
                value={formatDateTime(proposal.CreatedAt)}
              />
              <DetailItem
                icon={<Check fontSize="small" />}
                label="Confirmed At"
                value={formatDateTime(proposal.ConfirmedAt)}
              />
              <DetailItem
                icon={<CheckCircle fontSize="small" />}
                label="Completed At"
                value={formatDateTime(proposal.CompletedAt)}
              />
            </Stack>
          </Grid>

          {/* Participants */}
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                Participants
              </Typography>
              <DetailItem
                icon={<Person fontSize="small" />}
                label="Created By"
                value={`User #${proposal.CreatedBy}`}
              />
              <DetailItem
                icon={<Person fontSize="small" />}
                label="Confirmed By"
                value={
                  proposal.ConfirmedBy ? `User #${proposal.ConfirmedBy}` : "-"
                }
              />
              <DetailItem
                icon={<Person fontSize="small" />}
                label="Partner"
                value={
                  proposal.PartnerID ? `Partner #${proposal.PartnerID}` : "-"
                }
              />
            </Stack>
          </Grid>
        </Grid>

        {/* Description */}
        {proposal.Description && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              bgcolor: theme.palette.action.hover,
              borderRadius: 2,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Description fontSize="small" color="disabled" />
              <Typography variant="body2" color="text.secondary">
                {proposal.Description}
              </Typography>
            </Stack>
          </Box>
        )}

        {/* نمایش وضعیت مراحل (در صورت ذخیره شدن wizard state) */}
        {proposal.step !== undefined && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {proposal.step} / {steps.length}
            </Typography>
          </Box>
        )}

        {/* Actions */}
        {proposal.Status === "Pending" && (
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={handleComplete}
            disabled={isApproving || !traderID}
            sx={{
              minWidth: 120,
              bgcolor: isBuyAction
                ? theme.palette.success.main
                : theme.palette.error.main,
              "&:hover": {
                bgcolor: isBuyAction
                  ? theme.palette.success.dark
                  : theme.palette.error.dark,
              },
            }}
          >
            {isApproving ? "در حال پردازش..." : "تکمیل پیشنهاد"}
          </Button>
        )}

        {proposal.Status === "Confirmed" && (
          <Button
            variant="contained"
            startIcon={<Check />}
            onClick={() => onCompleteWizard(proposal)}
            sx={{
              minWidth: 120,
              bgcolor: theme.palette.info.main,
              "&:hover": {
                bgcolor: theme.palette.info.dark,
              },
            }}
          >
            بازکردن مودال
          </Button>
        )}

        {proposal.Status === "Pending" && (
          <LinearProgress
            color="secondary"
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 2,
            }}
          />
        )}
      </Box>
    </Paper>
  );
}

const DetailItem = ({ icon, label, value, unit }) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box sx={{ color: "text.secondary", width: 24 }}>{icon}</Box>
    <Typography variant="body2" sx={{ minWidth: 100, color: "text.secondary" }}>
      {label}:
    </Typography>
    <Typography variant="body2" fontWeight={500}>
      {value} {unit && <span style={{ color: "#666" }}>{unit}</span>}
    </Typography>
  </Stack>
);

export default function ProposalsSection({ onRefreshData }) {
  const theme = useTheme();
  const [allProposals, setAllProposals] = useState([]);
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState(null);

  useEffect(() => {
    const fetchAllProposals = async () => {
      try {
        const data = await EquilibriumService.listProposals();
        setAllProposals(data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      }
    };
    fetchAllProposals();
  }, []);

  const filteredProposals = allProposals.filter(
    (p) => p.Status === statusFilter
  );

  const handleCompleteWizard = (proposal) => {
    setSelectedProposal(proposal);
    setWizardOpen(true);
  };
  const extractedTraderID = getUserID();
  console.log(extractedTraderID);
  if (!extractedTraderID) {
    console.error(
      "TraderID could not be extracted. Please check token validity."
    );
  } else {
    console.log("Extracted TraderID:", extractedTraderID);
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[3],
        bgcolor: theme.palette.background.paper,
      }}
    >
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" spacing={2}>
            <AutoAwesomeMotion sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6" fontWeight={700}>
              Market Proposals
            </Typography>
          </Stack>
        }
        action={
          <Stack direction="row" spacing={2} alignItems="center">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Filter Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter Status"
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Confirmed">Confirmed</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="Completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              startIcon={<Cached />}
              onClick={async () => {
                try {
                  await EquilibriumService.autoCreateProposals();
                  onRefreshData?.();
                } catch (error) {
                  console.error("Auto rebalance error:", error);
                }
              }}
              sx={{ borderRadius: 2 }}
            >
              Refresh Data
            </Button>
          </Stack>
        }
        sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}
      />
      <CardContent>
        <Typography variant="subtitle1" sx={{ mb: 3, color: "text.secondary" }}>
          Showing {filteredProposals.length} proposals ({statusFilter})
        </Typography>

        {filteredProposals.length > 0 ? (
          <List disablePadding>
            {filteredProposals.map((proposal) => (
              <ProposalCard
                key={proposal.ProposalID}
                proposal={proposal}
                onRefreshData={onRefreshData}
                onCompleteWizard={handleCompleteWizard}
                traderID={extractedTraderID} // اضافه کردن این خط
                setAllProposals={setAllProposals}
              />
            ))}
          </List>
        ) : (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: theme.palette.action.hover,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No proposals found matching current filters.
            </Typography>
          </Box>
        )}
      </CardContent>
      {wizardOpen && selectedProposal && (
        <ConfirmProposalWizard
          open={wizardOpen}
          onClose={() => {
            setWizardOpen(false);
            setSelectedProposal(null);
            onRefreshData?.();
          }}
          proposal={selectedProposal}
          resumeStep={1} // یا مرحله‌ای که بخواهید از آن شروع شود
          onComplete={async (wizardData) => {
            try {
              // در اینجا عملیات نهایی تایید پیشنهاد، ثبت تراکنش، آپلود فیش و غیره انجام می‌شود
              await EquilibriumService.approveProposal(
                selectedProposal.ProposalID,
                {
                  ConfirmedBy: extractedTraderID, // شناسه کاربر جاری
                }
              );
              await EquilibriumService.createTransaction(
                wizardData.transactionInfo
              );
              await EquilibriumService.uploadReceipt({
                TransactionID: wizardData.transactionInfo.ProposalID, // باید TransactionID واقعی دریافت شود
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
    </Card>
  );
}
