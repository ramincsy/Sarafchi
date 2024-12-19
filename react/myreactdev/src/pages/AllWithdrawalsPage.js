import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllWithdrawalsPage.css";

export default function AllWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState(null);

  // واکشی اطلاعات برداشت‌ها
  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/withdrawals");
        if (res.data.success) {
          setWithdrawals(res.data.data);
        } else {
          setError("خطا در دریافت اطلاعات برداشت‌ها");
        }
      } catch (err) {
        console.error("Error fetching withdrawals:", err);
        setError("خطای شبکه یا سرور");
      }
    };
    fetchWithdrawals();
  }, []);

  // تأیید برداشت
  const handleApproveWithdrawal = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/withdrawals/${id}/status`,
        { Status: "Approved" }
      );

      if (res.data.success) {
        alert("برداشت تأیید شد");
        setWithdrawals((prev) =>
          prev.map((w) =>
            w.WithdrawalID === id ? { ...w, Status: "Approved" } : w
          )
        );
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error approving withdrawal:", err);
      alert("خطا در تأیید برداشت");
    }
  };

  // لغو برداشت
  const handleRejectWithdrawal = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/withdrawals/${id}/status`,
        { Status: "Rejected" }
      );

      if (res.data.success) {
        alert("برداشت لغو شد");
        setWithdrawals((prevWithdrawals) =>
          prevWithdrawals.map((w) =>
            w.WithdrawalID === id ? { ...w, Status: "Rejected" } : w
          )
        );
      } else {
        alert(res.data.message);
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      alert("خطا در لغو برداشت");
    }
  };

  return (
    <div className="withdrawals-page-container">
      <h1>تمام برداشت‌ها</h1>
      {error && <div className="error">{error}</div>}
      <div className="withdrawals-table-container">
        <table>
          <thead>
            <tr>
              <th>شناسه</th>
              <th>کاربر</th>
              <th>مقدار</th>
              <th>نوع ارز</th>
              <th>شماره شبا</th>
              <th>نام صاحب حساب</th>
              <th>تاریخ و ساعت</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.WithdrawalID}>
                <td>{withdrawal.WithdrawalID}</td>
                <td>{withdrawal.UserID}</td>
                <td>{withdrawal.Amount.toLocaleString()}</td>
                <td>{withdrawal.CurrencyType}</td>
                <td>{withdrawal.IBAN}</td>
                <td>{withdrawal.AccountHolderName}</td>
                <td>
                  {new Date(withdrawal.WithdrawalDateTime).toLocaleString()}
                </td>
                <td className={`status ${withdrawal.Status.toLowerCase()}`}>
                  {withdrawal.Status}
                </td>
                <td>
                  {withdrawal.Status === "Pending" && (
                    <div className="actions">
                      <button
                        className="approve-btn"
                        onClick={() =>
                          handleApproveWithdrawal(withdrawal.WithdrawalID)
                        }
                      >
                        تأیید
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() =>
                          handleRejectWithdrawal(withdrawal.WithdrawalID)
                        }
                      >
                        لغو
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
