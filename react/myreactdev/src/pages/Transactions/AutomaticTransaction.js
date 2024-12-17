import React, { useState, useEffect, useMemo, useContext } from "react";
import "./AutomaticTransaction.css";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import AuthContext from "../../contexts/AuthContext";

const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 300);

  return (
    <input
      value={value || ""}
      onChange={(e) => {
        setValue(e.target.value);
        onChange(e.target.value);
      }}
      placeholder="جستجو..."
      className="search-input"
    />
  );
};

const AutomaticTransaction = () => {
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("buy");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTableOpen, setTableOpen] = useState(false);
  const { userInfo } = useContext(AuthContext);

  const getCurrentUserID = () => {
    if (userInfo && userInfo.user_id) {
      return userInfo.user_id;
    }
    const storedUserInfo = JSON.parse(localStorage.getItem("user_info"));
    return storedUserInfo && storedUserInfo.user_id
      ? storedUserInfo.user_id
      : null;
  };

  const currentUserID = getCurrentUserID();
  const createdBy = currentUserID || "System";
  console.log(createdBy);

  useEffect(() => {
    const fetchPrice = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/live-price?currency=${currency}`
        );
        if (!response.ok) throw new Error("Failed to fetch price.");
        const data = await response.json();
        if (data.success) {
          setPrice(data.price);
        } else {
          throw new Error("Price not available");
        }
      } catch (error) {
        console.error("Error fetching price:", error);
        setPrice(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [currency]);

  const fetchTransactions = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/transactions");
      if (!response.ok) throw new Error("Failed to fetch transactions.");
      const data = await response.json();
      setTransactions(
        data.map((transaction) => ({
          id: transaction.TransactionID,
          date: new Date(transaction.TransactionDateTime).toLocaleString(
            "fa-IR"
          ),
          type: transaction.TransactionType,
          currency: transaction.CurrencyType,
          price: transaction.Price,
          quantity: transaction.Quantity,
          total: transaction.Quantity * transaction.Price,
        }))
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    if (price && value) {
      setTotal(value * price);
    } else {
      setTotal(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionData = {
      UserID: currentUserID || 1, // از user_id کاربر استفاده کنید، در صورت نبود مقدار 1
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: "معامله اتوماتیک",
      Position: transactionType === "buy" ? "Buy" : "Sell",
      CurrencyType: currency,
      CreatedBy: createdBy,
    };

    console.log("Sending transaction data:", transactionData);

    try {
      const response = await fetch("http://localhost:5000/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) throw new Error("Failed to save transaction.");
      alert("تراکنش با موفقیت ثبت شد");
      setQuantity("");
      setTotal(null);
      fetchTransactions();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("خطا در ثبت تراکنش");
    }
  };

  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "id" },
      { Header: "تاریخ", accessor: "date" },
      { Header: "نوع معامله", accessor: "type" },
      { Header: "ارز", accessor: "currency" },
      { Header: "قیمت", accessor: "price" },
      { Header: "تعداد", accessor: "quantity" },
      { Header: "مجموع", accessor: "total" },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state,
    setGlobalFilter,
  } = useTable({ columns, data: transactions }, useFilters, useGlobalFilter);

  return (
    <div className="transaction-container">
      <h2 className="form-title">معامله اتوماتیک</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>نوع معامله:</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            className="form-control"
          >
            <option value="buy">خرید</option>
            <option value="sell">فروش</option>
          </select>
        </div>
        <div className="form-group">
          <label>نوع ارز:</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="form-control"
          >
            <option value="USD">دلار</option>
            <option value="USDT">تتر</option>
            <option value="CNY">یوان</option>
            <option value="TRY">لیر</option>
          </select>
        </div>
        <div className="form-group">
          <label>تعداد:</label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
            className="form-control"
            disabled={loading || !price}
          />
        </div>
        <div className="form-group">
          <label>قیمت (از API):</label>
          <input
            type="text"
            value={
              loading ? "در حال بارگذاری..." : price || "خطا در دریافت قیمت"
            }
            readOnly
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>مجموع:</label>
          <input
            type="text"
            value={loading || total === null ? "در حال محاسبه..." : total}
            readOnly
            className="form-control"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !price || !quantity}
          className="submit-btn"
        >
          ثبت معامله
        </button>
      </form>

      <div className="transaction-history">
        <h3
          onClick={() => setTableOpen(!isTableOpen)}
          className="history-title"
        >
          تاریخچه معاملات
          <span className="table-toggle-icon">
            {isTableOpen ? <FaChevronUp /> : <FaChevronDown />}
          </span>
        </h3>
        {isTableOpen && (
          <div>
            <GlobalFilter
              globalFilter={state.globalFilter}
              setGlobalFilter={setGlobalFilter}
            />
            <table {...getTableProps()} className="transaction-table">
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

export default AutomaticTransaction;
