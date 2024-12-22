import React, { useState, useEffect, useMemo, useContext } from "react";
import "./SuggestedTransaction.css";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import AuthContext from "../../contexts/AuthContext"; // اضافه کنید اگر نیاز هست
import TransactionService from "../../services/TransactionService";

// Global Filter Component
const GlobalFilter = ({ globalFilter, setGlobalFilter }) => {
  const [value, setValue] = useState(globalFilter);
  const onChange = useAsyncDebounce((value) => {
    setGlobalFilter(value || undefined);
  }, 200);

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

const SuggestedTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("buy");
  const [isTableOpen, setTableOpen] = useState(false);

  const { userInfo } = useContext(AuthContext);

  // تابع برای گرفتن user_id از userInfo یا localStorage
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
  const createdBy = currentUserID || "System"; // CreatedBy هم بر اساس user_id

  const fetchTransactions = async () => {
    try {
      const data = await TransactionService.fetchTransactions(); // استفاده از TransactionService
      setTransactions(
        data.map((transaction) => ({
          id: transaction.TransactionID,
          date: new Date(transaction.TransactionDateTime).toLocaleString(
            "fa-IR"
          ),
          userID: transaction.UserID,
          createdBy: transaction.CreatedBy,
          quantity: transaction.Quantity,
          price: transaction.Price,
          total: transaction.Quantity * transaction.Price,
          type: transaction.TransactionType,
          status: transaction.Status,
          currency: transaction.CurrencyType,
        }))
      );
    } catch (error) {
      console.error("Error fetching transactions:", error);
      alert("خطا در واکشی تراکنش‌ها");
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
    if (price && e.target.value) {
      setTotal(e.target.value * price);
    }
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
    if (quantity && e.target.value) {
      setTotal(e.target.value * quantity);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // حالا UserID را از currentUserID استفاده می‌کنیم، نه عدد ثابت 1
    const transactionData = {
      UserID: currentUserID || 1, // اگر user_id وجود ندارد 1 درنظر بگیرید، در صورت تمایل
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: "معامله پیشنهادی",
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

      if (!response.ok) {
        throw new Error("ثبت تراکنش با خطا مواجه شد");
      }

      alert("تراکنش با موفقیت ثبت شد");
      fetchTransactions();
    } catch (error) {
      console.error(error);
      alert("خطا در ثبت تراکنش");
    }
  };

  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "id" },
      { Header: "تاریخ", accessor: "date" },
      { Header: "ایجادکننده", accessor: "createdBy" },
      { Header: "شناسه کاربر", accessor: "userID" },
      { Header: "تعداد", accessor: "quantity" },
      { Header: "قیمت", accessor: "price" },
      { Header: "مجموع", accessor: "total" },
      { Header: "نوع معامله", accessor: "type" },
      { Header: "وضعیت", accessor: "status" },
      { Header: "ارز", accessor: "currency" },
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
      <h2>معامله پیشنهادی</h2>
      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label>نوع معامله:</label>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
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
          >
            <option value="USD">دلار</option>
            <option value="USDT">تتر</option>
            <option value="CNY">یوان</option>
            <option value="TRY">لیر</option>
          </select>
        </div>
        <div className="form-group">
          <label>قیمت:</label>
          <input
            type="number"
            value={price}
            onChange={handlePriceChange}
            min="0"
          />
        </div>
        <div className="form-group">
          <label>تعداد:</label>
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min="1"
          />
        </div>
        <div className="form-group">
          <label>مجموع:</label>
          <input type="text" value={total || "در حال محاسبه..."} readOnly />
        </div>
        <button type="submit">ثبت معامله</button>
      </form>

      {/* جدول تاریخچه تراکنش‌ها */}
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

export default SuggestedTransaction;
