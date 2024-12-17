import React, { useState, useEffect } from "react";
import axios from "axios";
import "../pages/AdminDashboard.css";

export default function Dashboard() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [error, setError] = useState(null);
  const [transactionStats, setTransactionStats] = useState({
    allTransactions: 0,
    suggestedTransactions: 0,
    onlineTransactions: 0,
    automaticTransactions: 0,
    totalTransactions: 0,
    withdrawals: 0, // New stat for withdrawals
  });
  const [livePrice, setLivePrice] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [buyPrice, setBuyPrice] = useState(null);

  const [sideBoxContent, setSideBoxContent] = useState([
    "اطلاعات ۱",
    "اطلاعات ۲",
    "اطلاعات ۳",
    "اطلاعات ۴",
    "اطلاعات ۵",
    "اطلاعات ۶",
    "اطلاعات ۷",
    "اطلاعات ۸",
  ]);

  const [transactions, setTransactions] = useState({
    allTransactions: [],
    suggestedTransactions: [],
    onlineTransactions: [],
    automaticTransactions: [],
    reviewTransactions: [],
    approvedTransactions: [],
    canceledTransactions: [],
  });

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
    const fetchPrice = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/live-price");
        if (res.data.success) {
          const sellPrice = res.data.price;
          const calculatedBuyPrice = sellPrice - 950;
          setLivePrice(sellPrice); // قیمت فروش
          setBuyPrice(calculatedBuyPrice); // قیمت خرید
        } else {
          setPriceError("خطا در دریافت قیمت");
        }
      } catch (error) {
        setPriceError("خطای شبکه یا سرور");
      } finally {
        setLoadingPrice(false);
      }
    };

    const fetchData = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/transactions");
        const data = res.data;

        // Update transactions
        const updatedTransactions = {
          allTransactions: data,
          suggestedTransactions: data.filter(
            (tx) => tx.TransactionType === "معامله پيشنهادي"
          ),
          onlineTransactions: data.filter(
            (tx) => tx.TransactionType === "معامله روي خط"
          ),
          automaticTransactions: data.filter(
            (tx) => tx.TransactionType === "معامله اتوماتيک"
          ),
          reviewTransactions: data.filter((tx) => tx.Status === "Processing"),
          approvedTransactions: data.filter((tx) => tx.Status === "Completed"),
          canceledTransactions: data.filter((tx) => tx.Status === "Canceled"),
        };
        setTransactions(updatedTransactions);

        // Update transaction stats
        setTransactionStats({
          allTransactions: data,
          suggestedTransactions:
            updatedTransactions.suggestedTransactions.length,
          onlineTransactions: updatedTransactions.onlineTransactions.length,
          automaticTransactions:
            updatedTransactions.automaticTransactions.length,
          totalTransactions: updatedTransactions.allTransactions.length,
          withdrawals: 0, // You would typically fetch this from an API
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    fetchPrice();
    fetchWithdrawals();
  }, []);

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

  const handleRejectWithdrawal = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/withdrawals/${id}/status`,
        { Status: "Rejected" } // ارسال وضعیت لغو به سرور
      );

      if (res.data.success) {
        alert("برداشت لغو شد");

        // به‌روزرسانی وضعیت در لیست برداشت‌ها
        setWithdrawals((prevWithdrawals) =>
          prevWithdrawals.map((w) =>
            w.WithdrawalID === id ? { ...w, Status: "Rejected" } : w
          )
        );
      } else {
        alert(`خطا: ${res.data.message}`);
      }
    } catch (err) {
      console.error("Error rejecting withdrawal:", err);
      alert("خطا در لغو برداشت");
    }
  };

  const renderTable = (title, transactions, className) => (
    <div className={`table-container ${className}`}>
      <h2 className="table-title">{title}</h2>
      <table>
        <thead>
          <tr>
            <th>شناسه</th>
            <th>کاربر</th>
            <th>نوع</th>
            <th>معامله</th>
            <th>ارز</th>
            <th>تعداد</th>
            <th>قیمت</th>
            <th>مبلغ</th>
            <th>تاریخ و ساعت</th>
            <th>وضعیت</th>
            <th>عملیات</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.TransactionID}>
              <td>{tx.TransactionID}</td>
              <td>{tx.UserID}</td>
              <td>{tx.Position}</td>
              <td>{tx.TransactionType}</td>
              <td>{tx.CurrencyType}</td>
              <td>{tx.Quantity}</td>
              <td>{tx.Price}</td>
              <td>{tx.Quantity * tx.Price}</td>
              <td>{new Date(tx.TransactionDateTime).toLocaleString()}</td>
              <td className={`status ${tx.Status.toLowerCase()}`}>
                {tx.Status}
              </td>
              <td>
                {tx.Status === "Processing" && (
                  <div className="actions">
                    <button
                      className="approve-btn"
                      onClick={() => handleApprove(tx.TransactionID)}
                    >
                      تأیید
                    </button>
                    <button
                      className="reject-btn"
                      onClick={() => handleReject(tx.TransactionID)}
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
  );

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/transactions/confirm/${id}`
      );
      if (res.data.success) {
        alert(res.data.message);
        window.location.reload();
      } else {
        alert(`Error: ${res.data.error}`);
      }
    } catch (error) {
      console.error("Error approving transaction:", error);
      alert("خطا در تایید تراکنش");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/transactions/cancel/${id}`
      );
      if (res.data.success) {
        alert(res.data.message);
        window.location.reload();
      } else {
        alert(`Server Error: ${res.data.error}`);
      }
    } catch (error) {
      console.error("Error rejecting transaction:", error);
      alert("خطا در لغو تراکنش");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Top Full-Width Boxes */}
      <div className="top-stats-container">
        <div className="stats-boxes">
          <div className="stat-box">
            <span>تعداد تراکنش‌های پیشنهادی</span>
            <div className="stat-value">
              {transactionStats.suggestedTransactions}
            </div>
          </div>
          <div className="stat-box">
            <span>تعداد تراکنش‌های روی خط</span>
            <div className="stat-value">
              {transactionStats.onlineTransactions}
            </div>
          </div>
          <div className="stat-box">
            <span>تعداد تراکنش‌های اتوماتیک</span>
            <div className="stat-value">
              {transactionStats.automaticTransactions}
            </div>
          </div>
          <div className="stat-box">
            <span>تعداد کل تراکنش‌ها</span>
            <div className="stat-value">
              {transactionStats.totalTransactions}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        {/* Left Side Large Box (1/4 width) */}
        <div className="left-large-box">
          <h3>جدول برداشت‌ها</h3>
          <div className="table-container">
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

        {/* Right Side Boxes */}
        <div className="right-side-container">
          {/* Top Small Boxes */}
          <div className="small-boxes-container">
            {loadingPrice ? (
              <div className="small-box">در حال بارگذاری قیمت...</div>
            ) : priceError ? (
              <div className="small-box">{priceError}</div>
            ) : (
              <>
                <div className="small-box">
                  <span>قیمت فروش:</span>
                  <div className="price-value">
                    {livePrice?.toLocaleString()} تومان
                  </div>
                </div>
                <div className="small-box">
                  <span>قیمت خرید:</span>
                  <div className="price-value">
                    {buyPrice?.toLocaleString()} تومان
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Transaction Table */}
          <div className="transactions-table-container">
            {renderTable(
              "معاملات",
              transactions.allTransactions,
              "suggested-transactions"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
