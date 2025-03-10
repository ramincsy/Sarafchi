// TransactionTable.js
import React, { useCallback, useState, useMemo } from "react";
import {
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AdvancedTable from "components/tables/AdvancedTable";
import ApiManager from "services/ApiManager";

const TransactionTable = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  // گرفتن لیست تراکنش‌ها از بک‌اند
  const fetchData = useCallback(async () => {
    try {
      const data = await ApiManager.TransactionsService.fetchTransactions();
      return data.map((transaction, index) => ({
        TransactionID: transaction.TransactionID || index,
        TransactionType: transaction.TransactionType || index,
        UserID: transaction.UserID,
        Amount: transaction.Quantity,
        Currency: transaction.CurrencyType,
        Price: transaction.Price,
        Total: transaction.Quantity * transaction.Price,
        Date: new Date(transaction.TransactionDateTime).toLocaleString("fa-IR"),
        Status: transaction.Status || "Unknown",
      }));
    } catch (error) {
      console.error("خطا در دریافت تراکنش‌ها:", error);
      return [];
    }
  }, []);

  // ستون‌های جدول
  const columns = useMemo(
    () => [
      { field: "TransactionID", label: "شناسه" },
      { field: "TransactionType", label: "نوع معامله" },
      { field: "UserID", label: "کاربر" },
      { field: "Amount", label: "مقدار" },
      { field: "Currency", label: "ارز" },
      { field: "Price", label: "قیمت" },
      { field: "Total", label: "مجموع" },
      { field: "Date", label: "تاریخ" },
      { field: "Status", label: "وضعیت" },
    ],
    []
  );

  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" sx={{ fontSize: "1rem" }}>
          تاریخچه معاملات
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          overflowY: "auto",
          maxHeight: "50vh",
        }}
      >
        <AdvancedTable
          key={refreshKey}
          columns={columns}
          fetchData={fetchData}
          defaultPageSize={10}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default TransactionTable;
