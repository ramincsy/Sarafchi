// ConfirmProposalWizard.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  TextField,
} from "@mui/material";
import { Close, Check } from "@mui/icons-material";
import TransactionForm from "./TransactionForm";
import ReceiptUploadForm from "./ReceiptUploadForm";
import CounterpartyForm from "./CounterpartyForm";
import EquilibriumService from "services/EquilibriumService";
import { getUserID } from "utils/userUtils";

const steps = [
  "نمایش پیشنهاد",
  "اطلاعات معامله",
  "آپلود فیش‌ها",
  "توضیحات نهایی",
];

const ConfirmProposalWizard = ({
  open,
  onClose,
  proposal,
  resumeStep = 1,
  onComplete,
}) => {
  // استخراج TraderID از توکن یا localStorage
  const extractedTraderID = getUserID();
  console.log(extractedTraderID);
  if (!extractedTraderID) {
    console.error(
      "TraderID could not be extracted. Please check token validity."
    );
  } else {
    console.log("Extracted TraderID:", extractedTraderID);
  }

  const [activeStep, setActiveStep] = useState(resumeStep);
  const [loading, setLoading] = useState(false);
  const [wizardData, setWizardData] = useState({
    transactionInfo: {
      ProposalID: proposal ? proposal.ProposalID : "",
      TraderID: extractedTraderID || "", // تنظیم TraderID از توکن
      PartnerID: "",
      Amount: proposal ? proposal.Amount : "",
      Price: proposal ? proposal.Price : "",
      Details: "",
    },
    receiptsInfo: {
      TomanReceipt: "",
      USDTReceipt: "",
    },
    finalRemarks: "",
    newPartner: {},
  });

  // بارگذاری وضعیت ذخیره‌شده Wizard (در صورت وجود)
  useEffect(() => {
    if (proposal && wizardData.transactionInfo.TraderID) {
      console.log(
        "Attempting to load saved wizard state for ProposalID:",
        proposal.ProposalID,
        "and TraderID:",
        wizardData.transactionInfo.TraderID
      );
      EquilibriumService.getWizardState(
        proposal.ProposalID,
        wizardData.transactionInfo.TraderID
      )
        .then((data) => {
          if (data && data.Step !== undefined) {
            console.log("Loaded wizard state:", data);
            setActiveStep(data.Step);
            if (data.WizardData) {
              try {
                const parsedData = JSON.parse(data.WizardData);
                setWizardData(parsedData);
                console.log("WizardData parsed successfully:", parsedData);
              } catch (parseError) {
                console.error("Error parsing WizardData:", parseError);
              }
            }
          } else {
            console.log("No saved wizard state found.");
          }
        })
        .catch((err) => {
          console.error("Error loading wizard state:", err);
        });
    } else {
      if (!wizardData.transactionInfo.TraderID) {
        console.warn("TraderID is not set. Cannot load saved wizard state.");
      }
    }
  }, [proposal, wizardData.transactionInfo.TraderID]);

  // ذخیره وضعیت فعلی Wizard در بک‌اند
  const saveCurrentWizardState = async (step) => {
    const payload = {
      ProposalID: proposal.ProposalID,
      TraderID: wizardData.transactionInfo.TraderID,
      Step: step,
      WizardData: JSON.stringify(wizardData),
    };
    console.log("Saving wizard state with payload:", payload);
    try {
      await EquilibriumService.saveWizardState(payload);
      console.log("Wizard state saved successfully at step:", step);
    } catch (error) {
      console.error("Error saving wizard state:", error);
    }
  };

  const handleNext = async () => {
    // ذخیره وضعیت Wizard قبل از رفتن به مرحله بعد
    await saveCurrentWizardState(activeStep);

    if (activeStep === 1) {
      // در مرحله اطلاعات معامله: ایجاد تراکنش
      try {
        const txRes = await EquilibriumService.createTransaction(
          wizardData.transactionInfo
        );
        if (txRes && txRes.transaction_id) {
          // ذخیره شناسه تراکنش دریافتی در wizardData
          setWizardData((prevData) => ({
            ...prevData,
            transactionInfo: {
              ...prevData.transactionInfo,
              TransactionID: txRes.transaction_id,
            },
          }));
        } else {
          throw new Error("تراکنش ایجاد نشد.");
        }
      } catch (error) {
        console.error("خطا در ایجاد تراکنش:", error);
        alert("خطا در ایجاد تراکنش: " + error.message);
        return; // جلوگیری از رفتن به مرحله بعد
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = async () => {
    await saveCurrentWizardState(activeStep);
    setActiveStep((prev) => prev - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await onComplete(wizardData);
      console.log("Wizard completed with data:", wizardData);
      onClose();
    } catch (error) {
      console.error("Error finishing wizard:", error);
    }
    setLoading(false);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <div>
            <h6>جزئیات پیشنهاد</h6>
            {proposal ? (
              <>
                <p>عمل: {proposal.ProposalType}</p>
                <p>ارز: {proposal.Currency}</p>
                <p>مقدار: {proposal.Amount}</p>
              </>
            ) : (
              <p>اطلاعات پیشنهاد در دسترس نیست.</p>
            )}
          </div>
        );
      case 1:
        return (
          <TransactionForm
            wizardData={wizardData}
            setWizardData={setWizardData}
          />
        );
      case 2:
        return (
          <ReceiptUploadForm
            wizardData={wizardData}
            setWizardData={setWizardData}
          />
        );
      case 3:
        return (
          <div>
            <h6>توضیحات نهایی</h6>
            <TextField
              label="توضیحات"
              multiline
              rows={3}
              fullWidth
              value={wizardData.finalRemarks}
              onChange={(e) =>
                setWizardData({ ...wizardData, finalRemarks: e.target.value })
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>تأیید پیشنهاد</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent()}
      </DialogContent>
      <DialogActions>
        {activeStep > 0 && (
          <Button onClick={handleBack} startIcon={<Close />}>
            قبلی
          </Button>
        )}
        {activeStep < steps.length - 1 && (
          <Button onClick={handleNext} variant="contained" endIcon={<Check />}>
            مرحله بعد
          </Button>
        )}
        {activeStep === steps.length - 1 && (
          <Button
            variant="contained"
            color="success"
            onClick={handleFinish}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "پایان و ثبت"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmProposalWizard;
