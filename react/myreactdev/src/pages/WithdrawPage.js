import React, { useState, useMemo, useEffect } from "react";
import "./WithdrawPage.css";
import { useTable, useGlobalFilter } from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import CardToIban from "./CardToIban";
import IbanInquiry from "./IbanInquiry";
import WithdrawalsService from "../services/WithdrawalsService";

const WithdrawPage = () => {
  const [accountNumber, setAccountNumber] = useState("");
  const [personName, setPersonName] = useState("");
  const [rialAmount, setRialAmount] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isTableOpen, setTableOpen] = useState(false);
  const [withdrawHistory, setWithdrawHistory] = useState([]);

  // دریافت user_id از localStorage
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

  // دریافت تاریخچه برداشت‌ها
  const fetchWithdrawals = async () => {
    try {
      const data = await WithdrawalsService.fetchWithdrawals();
      console.log("Data fetched from server:", data);
      if (data.success) {
        setWithdrawHistory(data.data);
      } else {
        setError(data.error || "خطا در دریافت داده‌ها");
      }
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
      setError("خطا در دریافت تاریخچه برداشت.");
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  // ثبت درخواست برداشت
  const handleWithdraw = async () => {
    const user_id = getUserID();

    if (!accountNumber || !personName || !rialAmount) {
      setError("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    const payload = {
      UserID: user_id,
      Amount: rialAmount,
      CurrencyType: "ریال",
      IBAN: accountNumber,
      AccountHolderName: personName,
      WithdrawalDateTime: new Date().toISOString(),
      Status: "Pending",
      Description: "درخواست برداشت ریالی",
      CreatedBy: user_id,
      CardNumber: null,
      WalletAddress: null,
      TransferSource: null,
    };

    console.log("Payload to server:", payload);

    try {
      await WithdrawalsService.createWithdrawal(payload);
      setSuccess("درخواست برداشت شما با موفقیت ثبت شد.");
      setError(null);
      setAccountNumber("");
      setPersonName("");
      setRialAmount("");
      fetchWithdrawals();
    } catch (err) {
      console.error("Error submitting withdrawal request:", err);
      setError("خطا در ثبت درخواست برداشت. لطفاً مجدد تلاش کنید.");
      setSuccess(null);
    }
  };

  // ستون‌های جدول
  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "WithdrawalID" },
      { Header: "کاربر", accessor: "UserID" },
      { Header: "مقدار", accessor: "Amount" },
      { Header: "نوع ارز", accessor: "CurrencyType" },
      { Header: "وضعیت", accessor: "Status" },
      {
        Header: "تاریخ",
        accessor: "WithdrawalDateTime",
        Cell: ({ value }) =>
          value ? new Date(value).toLocaleString("fa-IR") : "نامشخص",
      },
    ],
    []
  );

  const data = useMemo(() => withdrawHistory, [withdrawHistory]);

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
