import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AllTransactionsPage.css";

export default function AllTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState(null);

  // واکشی تراکنش‌ها
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:5000/api/transactions");
        if (Array.isArray(res.data)) {
          setTransactions(res.data);
          setFilteredTransactions(res.data);
        } else {
          setError("فرمت داده‌ها صحیح نیست.");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
        setError("خطای شبکه یا سرور");
      }
    };

    fetchTransactions();
  }, []);

  // تأیید تراکنش
  const handleApprove = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/transactions/confirm/${id}`
      );
      if (res.data.success) {
        alert("تراکنش تأیید شد");
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.TransactionID === id ? { ...tx, Status: "Approved" } : tx
          )
        );
        setFilteredTransactions((prev) =>
          prev.map((tx) =>
            tx.TransactionID === id ? { ...tx, Status: "Approved" } : tx
          )
        );
      } else {
        alert(res.data.message || "خطا در تأیید تراکنش");
      }
    } catch (err) {
      console.error("Error approving transaction:", err);
      alert("خطا در تأیید تراکنش");
    }
  };

  // لغو تراکنش
  const handleReject = async (id) => {
    try {
      const res = await axios.post(
        `http://127.0.0.1:5000/api/transactions/cancel/${id}`
      );
      if (res.data.success) {
        alert("تراکنش لغو شد");
        setTransactions((prev) =>
          prev.map((tx) =>
            tx.TransactionID === id ? { ...tx, Status: "Rejected" } : tx
          )
        );
        setFilteredTransactions((prev) =>
          prev.map((tx) =>
            tx.TransactionID === id ? { ...tx, Status: "Rejected" } : tx
          )
        );
      } else {
        alert(res.data.message || "خطا در لغو تراکنش");
      }
    } catch (err) {
      console.error("Error rejecting transaction:", err);
      alert("خطا در لغو تراکنش");
    }
  };

  // فیلتر داده‌ها
  const handleFilterChange = (e) => {
    const query = e.target.value.toLowerCase();
    setFilter(query);
    setFilteredTransactions(
      transactions.filter((tx) =>
        Object.values(tx).some((value) =>
          value?.toString().toLowerCase().includes(query)
        )
      )
    );
  };

  return (
    <div className="transactions-page-container">
      <h1>تمام تراکنش‌ها</h1>
      {error && <div className="error">{error}</div>}
      <div className="filter-container">
        <input
          type="text"
          placeholder="فیلتر بر اساس هر فیلدی"
          value={filter}
          onChange={handleFilterChange}
          className="filter-input"
        />
      </div>
      <div className="transactions-table-container">
        <table>
          <thead>
            <tr>
              <th>شناسه</th>
              <th>کاربر</th>
              <th>نوع</th>
              <th>ارز</th>
              <th>تعداد</th>
              <th>قیمت</th>
              <th>مبلغ</th>
              <th>تاریخ</th>
              <th>وضعیت</th>
              <th>عملیات</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.TransactionID}>
                <td>{tx.TransactionID}</td>
                <td>{tx.UserID}</td>
                <td>{tx.TransactionType}</td>
                <td>{tx.CurrencyType}</td>
                <td>{tx.Quantity}</td>
                <td>{tx.Price}</td>
                <td>{(tx.Quantity * tx.Price).toLocaleString()}</td>
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
    </div>
  );
}
