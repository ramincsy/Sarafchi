// CounterpartyForm.js
import React from "react";
import { Box, TextField, Stack, Typography } from "@mui/material";

const CounterpartyForm = ({ wizardData, setWizardData }) => {
  return (
    <Box sx={{ border: "1px dashed grey", p: 2, borderRadius: 1, mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        فرم ثبت کاربر جدید
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="First Name"
          name="NewFirstName"
          value={wizardData.newPartner?.NewFirstName || ""}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              newPartner: {
                ...wizardData.newPartner,
                NewFirstName: e.target.value,
              },
            })
          }
          fullWidth
          size="small"
        />
        <TextField
          label="Last Name"
          name="NewLastName"
          value={wizardData.newPartner?.NewLastName || ""}
          onChange={(e) =>
            setWizardData({
              ...wizardData,
              newPartner: {
                ...wizardData.newPartner,
                NewLastName: e.target.value,
              },
            })
          }
          fullWidth
          size="small"
        />
        {/* سایر فیلدهای مورد نیاز می‌توانید اضافه کنید */}
      </Stack>
    </Box>
  );
};

export default CounterpartyForm;
