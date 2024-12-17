import React, { useState, useMemo } from "react";
import axios from "axios";
import "./WithdrawPage.css";
import { useTable, useGlobalFilter } from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CardToIban from "./CardToIban";
import IbanInquiry from "./IbanInquiry";

const mockWithdrawHistory = [
  { id: 1, type: "تتر", amount: 200, date: "2024-12-01" },
  { id: 2, type: "ریال", amount: 1000000, date: "2024-12-01" },
  { id: 3, type: "تتر", amount: 300, date: "2024-12-02" },
  { id: 4, type: "ریال", amount: 500000, date: "2024-12-02" },
];

const WithdrawPage = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [personName, setPersonName] = useState("");
  const [rialAmount, setRialAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isTableOpen, setTableOpen] = useState(false);

  // تابع ارسال اطلاعات به سرور
  const handleWithdraw = async () => {
    // تابع برای خواندن user_id از localStorage
    const getUserID = () => {
      try {
        const storedUserInfo = localStorage.getItem("user_info");
        if (storedUserInfo) {
          const { user_id } = JSON.parse(storedUserInfo);
          return user_id;
        }
      } catch (err) {
        console.error("Error reading user_id from localStorage:", err);
      }
      return null;
    };
    const user_id = getUserID();
    console.log(user_id);
    if (!accountNumber || !personName || !rialAmount) {
      setError("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/api/withdrawals",
        {
          UserID: user_id, // شناسه کاربر (تست)
          Amount: rialAmount,
          CurrencyType: "ریال",
          IBAN: accountNumber,
          AccountHolderName: personName,
          WithdrawalDateTime: new Date().toISOString(),
          Status: "Pending",
          Description: "درخواست برداشت ریالی",
          CreatedBy: user_id,
        }
      );

      setSuccess("درخواست برداشت شما با موفقیت ثبت شد.");
      setError(null);

      // پاک کردن فیلدها
      setAccountNumber("");
      setPersonName("");
      setRialAmount("");
    } catch (err) {
      setError("خطا در ثبت درخواست برداشت. لطفاً مجدد تلاش کنید.");
      setSuccess(null);
    }
  };

  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "id" },
      { Header: "نوع برداشت", accessor: "type" },
      { Header: "مقدار", accessor: "amount" },
      { Header: "تاریخ", accessor: "date" },
    ],
    []
  );

  const data = useMemo(() => mockWithdrawHistory, []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable({ columns, data }, useGlobalFilter);

  return (
    <div className="withdraw-page">
      <h1>صفحه برداشت</h1>

      <div className="withdraw-container">
        <div className="left-box">
          <CardToIban />
          <IbanInquiry />
        </div>

        <div className="right-box">
          <h3>فرم برداشت</h3>
          <div className="form-group">
            <label>شماره شبا:</label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="شماره شبا"
            />
          </div>
          <div className="form-group">
            <label>نام صاحب حساب:</label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="نام صاحب حساب"
            />
          </div>
          <div className="form-group">
            <label>مقدار درخواست برداشت:</label>
            <input
              type="number"
              value={rialAmount}
              onChange={(e) => setRialAmount(e.target.value)}
              placeholder="مقدار برداشت"
            />
          </div>
          <button onClick={handleWithdraw} className="submit-btn">
            تأیید برداشت
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {success && <p style={{ color: "green" }}>{success}</p>}
        </div>
      </div>

      <div className="withdraw-history">
        <h2
          onClick={() => setTableOpen(!isTableOpen)}
          className="history-title"
        >
          تاریخچه برداشت
          <span className="table-toggle-icon">
            {isTableOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h2>
        {isTableOpen && (
          <div>
            <input
              type="text"
              placeholder="جستجو..."
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="search-input"
            />
            <table {...getTableProps()} className="transactions-table">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th {...column.getHeaderProps()}>
                        {column.render("Header")}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()}>
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawPage;
