// TransactionPage.js
import React, { useState } from "react";
import {
  Grid,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import TransactionForm from "./TransactionForm";
import TransactionTable from "./TransactionTable";

const TransactionPage = () => {
  const [mode, setMode] = useState("automatic");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    // بعد از ثبت موفق، رفرش جدول
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Grid container spacing={2} padding={1}>
      <Grid item xs={12} md={4}>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(e, newMode) => {
            if (newMode !== null) setMode(newMode);
          }}
          sx={{
            width: "100%",
            backgroundColor: "rgba(248, 236, 236, 0.82)",
            mt: 0.5,
            mb: 1,
            borderRadius: 1,
            display: "flex",
            "& .MuiToggleButton-root": {
              flex: 1,
              fontSize: "1rem",
              px: 1,
              py: 0.5,
              borderRadius: 0,
              "&.Mui-selected": {
                backgroundColor: "rgb(25, 118, 211)",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "rgba(0, 128, 0, 0.7)",
                },
              },
              "&:not(:last-child)": {
                borderRight: "1px solid rgba(0, 0, 0, 0.12)",
              },
              "&:first-child": {
                borderRadius: "4px 0 0 4px",
              },
              "&:last-child": {
                borderRadius: "0 4px 4px 0",
              },
            },
          }}
        >
          <ToggleButton value="automatic">اتوماتیک</ToggleButton>
          <ToggleButton value="suggested">پیشنهادی</ToggleButton>
          <ToggleButton value="live">فردایی</ToggleButton>
        </ToggleButtonGroup>

        {/* فرم معامله */}
        <TransactionForm mode={mode} userId={1} onSuccess={handleSuccess} />
      </Grid>

      <Grid item xs={12} md={8}>
        {/* جدول تاریخچه */}
        <TransactionTable key={refreshKey} />
      </Grid>
    </Grid>
  );
};

export default TransactionPage;
