import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import CounterpartyForm from "./CounterpartyForm";
import EquilibriumService from "services/EquilibriumService";

const TransactionForm = ({ wizardData, setWizardData }) => {
  const [isNewPartner, setIsNewPartner] = useState(false);
  const [partnerOptions, setPartnerOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // دریافت لیست همکاران از سرویس
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const data = await EquilibriumService.fetchPartnerBalances();
        setPartnerOptions(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  if (loading) {
    return <Typography>در حال بارگذاری لیست همکاران...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error">
        خطا در دریافت لیست همکاران: {error.message}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        اطلاعات معامله
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Proposal ID"
          name="ProposalID"
          value={wizardData.transactionInfo.ProposalID}
          disabled
          fullWidth
        />
        <TextField
          label="Trader ID"
          name="TraderID"
          value={wizardData.transactionInfo.TraderID}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              transactionInfo: {
                ...wizardData.transactionInfo,
                TraderID: e.target.value,
              },
            })
          }
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel id="partner-select-label">انتخاب طرف معامله</InputLabel>
          <Select
            labelId="partner-select-label"
            name="PartnerID"
            value={wizardData.transactionInfo.PartnerID || ""}
            label="انتخاب طرف معامله"
            onChange={(e) => {
              const val = e.target.value;
              setWizardData({
                ...wizardData,
                transactionInfo: {
                  ...wizardData.transactionInfo,
                  PartnerID: val,
                },
              });
              setIsNewPartner(val === "new");
            }}
          >
            <MenuItem value="">انتخاب کنید...</MenuItem>
            {partnerOptions.map((partner) => (
              <MenuItem key={partner.UserID} value={partner.UserID}>
                {partner.FirstName} {partner.LastName} (موجودی:{" "}
                {partner.Balance})
              </MenuItem>
            ))}
            <MenuItem value="new">کاربر جدید</MenuItem>
          </Select>
        </FormControl>
        {isNewPartner && (
          <CounterpartyForm
            wizardData={wizardData}
            setWizardData={setWizardData}
          />
        )}
        <TextField
          label="Amount"
          name="Amount"
          value={wizardData.transactionInfo.Amount}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              transactionInfo: {
                ...wizardData.transactionInfo,
                Amount: e.target.value,
              },
            })
          }
          fullWidth
        />
        <TextField
          label="Price"
          name="Price"
          value={wizardData.transactionInfo.Price}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              transactionInfo: {
                ...wizardData.transactionInfo,
                Price: e.target.value,
              },
            })
          }
          fullWidth
        />
        <TextField
          label="Details"
          name="Details"
          value={wizardData.transactionInfo.Details}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              transactionInfo: {
                ...wizardData.transactionInfo,
                Details: e.target.value,
              },
            })
          }
          fullWidth
          multiline
        />
      </Stack>
    </Box>
  );
};

export default TransactionForm;
