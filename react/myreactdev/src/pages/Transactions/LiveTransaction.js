import React, { useState, useEffect, useMemo, useContext } from "react";
import "./LiveTransaction.css";
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useAsyncDebounce,
} from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import AuthContext from "../../contexts/AuthContext";
import ApiManager from "../../services/ApiManager"; // استفاده از ApiManager
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

const LiveTransaction = () => {
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [total, setTotal] = useState(null);
  const [currency, setCurrency] = useState("USD");
  const [transactionType, setTransactionType] = useState("buy");
  const [transactions, setTransactions] = useState([]);
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

  console.log("CreatedBy:", createdBy); // برای بررسی

  useEffect(() => {
    const fetchLivePrice = async () => {
      try {
        const data = await ApiManager.TransactionsService.fetchPrice(currency);
        setPrice(data.price);
      } catch (error) {
        console.error(error);
        setPrice(null);
      }
    };

    fetchLivePrice();
    const interval = setInterval(fetchLivePrice, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchTransactions = async () => {
    try {
      const data = await ApiManager.TransactionsService.fetchTransactions();
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
      console.error(error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const transactionData = {
      UserID: currentUserID || 1, // اگر user_id نداشتیم 1
      Quantity: parseFloat(quantity),
      Price: parseFloat(price),
      TransactionType: "معامله روی خط",
      Position: transactionType === "buy" ? "Buy" : "Sell",
      CurrencyType: currency,
      CreatedBy: createdBy,
    };
    console.log("Sending transaction data:", transactionData);

    try {
      await ApiManager.TransactionsService.createTransaction(transactionData);
      alert("تراکنش با موفقیت ثبت شد");
      setQuantity("");
      setTotal(null);
      fetchTransactions();
    } catch (error) {
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
      <h2>معامله زنده</h2>
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
          </select>
        </div>
        <div className="form-group">
          <label>قیمت:</label>
          <input type="number" value={price} readOnly />
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

      {/* تاریخچه معاملات */}
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

export default LiveTransaction;
