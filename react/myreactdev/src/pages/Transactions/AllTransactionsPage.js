import React from "react";
import AdvancedTable from "components/tables/AdvancedTable";
import ApiManager from "services/ApiManager";
import { Button, Box } from "@mui/material";

export default function AllTransactionsPage() {
  // تابع واکشی تراکنش‌ها
  const fetchTransactions = async () => {
    const data = await ApiManager.TransactionsService.fetchTransactions();
    if (Array.isArray(data)) {
      // افزودن فیلد محاسبه‌شده "Amount" و فرمت تاریخ به هر تراکنش
      return data.map((tx) => ({
        ...tx,
        Amount: (tx.Quantity * tx.Price).toLocaleString(),
        TransactionDateTime: new Date(tx.TransactionDateTime).toLocaleString(),
      }));
    } else {
      throw new Error("فرمت داده‌ها صحیح نیست.");
    }
  };

  // توابع عملیات: تأیید و لغو تراکنش
  const handleApprove = async (id) => {
    try {
      const response =
        await ApiManager.TransactionsService.updateTransactionStatus(
          id,
          "confirm"
        );
      if (response.success) {
        alert("تراکنش تأیید شد");
        // در صورت نیاز، وضعیت تراکنش را در لیست به‌روزرسانی کنید.
      } else {
        alert(response.message || "خطا در تأیید تراکنش");
      }
    } catch (err) {
      console.error("Error approving transaction:", err);
      alert("خطا در تأیید تراکنش");
    }
  };

  const handleReject = async (id) => {
    try {
      const response =
        await ApiManager.TransactionsService.updateTransactionStatus(
          id,
          "cancel"
        );
      if (response.success) {
        alert("تراکنش لغو شد");
        // در صورت نیاز، وضعیت تراکنش را در لیست به‌روزرسانی کنید.
      } else {
        alert(response.message || "خطا در لغو تراکنش");
      }
    } catch (err) {
      console.error("Error rejecting transaction:", err);
      alert("خطا در لغو تراکنش");
    }
  };

  // تعریف کامپوننت عملیات: در صورتی که تراکنش در وضعیت "Processing" باشد، دو دکمه تأیید و لغو نمایش داده می‌شود.
  const actions = (row) => {
    if (row.Status === "Processing") {
      return (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleApprove(row.TransactionID)}
          >
            تأیید
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => handleReject(row.TransactionID)}
          >
            لغو
          </Button>
        </Box>
      );
    }
    return null;
  };

  // تعریف ستون‌های جدول
  const columns = [
    { field: "TransactionID", label: "شناسه" },
    { field: "UserID", label: "کاربر" },
    { field: "TransactionType", label: "نوع" },
    { field: "CurrencyType", label: "ارز" },
    { field: "Quantity", label: "تعداد" },
    { field: "Price", label: "قیمت" },
    { field: "Amount", label: "مبلغ" },
    { field: "TransactionDateTime", label: "تاریخ" },
    { field: "Status", label: "وضعیت" },
  ];

  return (
    <div className="transactions-page-container">
      <h1>تمام تراکنش‌ها</h1>
      <AdvancedTable
        columns={columns}
        fetchData={fetchTransactions}
        actions={actions}
        defaultPageSize={10}
      />
    </div>
  );
}
