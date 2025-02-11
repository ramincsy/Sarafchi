import React, { useState, useEffect } from "react";
import AdvancedTable from "components/tables/AdvancedTable";
import WithdrawalsService from "services/WithdrawalsService";
import { Button } from "@mui/material";
import "assets/styles/AllWithdrawalsPage.css";

export default function AllWithdrawalsPage() {
  const [error, setError] = useState(null);

  // واکشی اطلاعات برداشت‌ها
  const fetchWithdrawals = async () => {
    try {
      const data = await WithdrawalsService.fetchWithdrawals();
      if (data.success) {
        return data.data;
      } else {
        setError("خطا در دریافت اطلاعات برداشت‌ها");
        return [];
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setError("خطای شبکه یا سرور");
      return [];
    }
  };

  // تأیید برداشت
  const handleApproveWithdrawal = async (row) => {
    try {
      const data = await WithdrawalsService.updateWithdrawalStatus(
        row.WithdrawalID,
        "Approved"
      );
      if (data.success) {
        alert("برداشت تأیید شد");
      } else {
        alert(data.message || "خطا در تأیید برداشت");
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      alert("خطا در تأیید برداشت");
    }
  };

  // رد برداشت
  const handleRejectWithdrawal = async (row) => {
    try {
      const data = await WithdrawalsService.updateWithdrawalStatus(
        row.WithdrawalID,
        "Rejected"
      );
      if (data.success) {
        alert("برداشت لغو شد");
      } else {
        alert(data.message || "خطا در لغو برداشت");
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      alert("خطا در لغو برداشت");
    }
  };

  // تابع رندر دکمه‌های عملیات برای هر ردیف
  const renderActions = (row) => {
    const actions = [
      {
        label: "تأیید",
        onClick: handleApproveWithdrawal,
        color: "success",
        condition: (row) => row.Status === "Pending",
      },
      {
        label: "رد",
        onClick: handleRejectWithdrawal,
        color: "error",
        condition: (row) => row.Status === "Pending",
      },
    ];

    return (
      <div style={{ display: "flex", gap: "8px" }}>
        {actions.map((action) => {
          if (action.condition && !action.condition(row)) return null;
          return (
            <Button
              key={action.label}
              variant="contained"
              color={action.color}
              onClick={() => action.onClick(row)}
            >
              {action.label}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="withdrawals-page-container">
      <h1>تمام برداشت‌ها</h1>
      {error && <div className="error">{error}</div>}

      <AdvancedTable
        columns={[
          { field: "WithdrawalID", label: "شناسه" },
          { field: "UserID", label: "کاربر" },
          { field: "Amount", label: "مقدار" },
          { field: "CurrencyType", label: "نوع ارز" },
          { field: "IBAN", label: "شماره شبا" },
          { field: "AccountHolderName", label: "نام صاحب حساب" },
          { field: "WithdrawalDateTime", label: "تاریخ و ساعت" },
          { field: "Status", label: "وضعیت" },
        ]}
        fetchData={fetchWithdrawals}
        actions={renderActions}
      />
    </div>
  );
}
