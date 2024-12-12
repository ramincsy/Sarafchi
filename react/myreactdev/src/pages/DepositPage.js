import React, { useState, useMemo } from "react";
import { QRCodeCanvas } from "qrcode.react"; // اصلاح ایمپورت
import "./DepositPage.css";
import { useTable, useGlobalFilter } from "react-table";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const mockDepositHistory = [
  { id: 1, type: "تتر", amount: 500, date: "2024-12-01" },
  { id: 2, type: "ریال", amount: 2000000, date: "2024-12-01" },
  { id: 3, type: "تتر", amount: 300, date: "2024-12-02" },
  { id: 4, type: "ریال", amount: 1000000, date: "2024-12-02" },
];

const DepositPage = () => {
  const [usdtAddress] = useState("0x1234567890abcdef1234567890abcdef12345678");
  const [usdtBalance] = useState(1500);
  const [rialAmount, setRialAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [isTableOpen, setTableOpen] = useState(false);

  const handleRialDeposit = () => {
    alert("اطلاعات واریز ثبت شد. به لینک بعدی متصل خواهید شد.");
  };

  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "id" },
      { Header: "نوع واریز", accessor: "type" },
      { Header: "مقدار", accessor: "amount" },
      { Header: "تاریخ", accessor: "date" },
    ],
    []
  );

  const data = useMemo(() => mockDepositHistory, []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable({ columns, data }, useGlobalFilter);

  return (
    <div className="deposit-page">
      <h1>صفحه واریز</h1>
      <div className="deposit-container">
        <div className="deposit-box deposit-usdt">
          <h3>واریز تتر</h3>
          <p>موجودی آنلاین: {usdtBalance} USDT</p>
          <p>آدرس کیف پول:</p>
          <div className="usdt-address">{usdtAddress}</div>
          <QRCodeCanvas
            value={usdtAddress}
            size={150}
            className="qrcode"
          />{" "}
          {/* اصلاح استفاده */}
        </div>

        <div className="deposit-box deposit-rial">
          <h3>واریز ریال</h3>
          <div className="form-group">
            <label>مقدار:</label>
            <input
              type="number"
              value={rialAmount}
              onChange={(e) => setRialAmount(e.target.value)}
              placeholder="مقدار ریال"
            />
          </div>
          <div className="form-group">
            <label>نام بانک:</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="نام بانک"
            />
          </div>
          <button onClick={handleRialDeposit} className="submit-btn">
            واریز
          </button>
        </div>
      </div>

      <div className="deposit-history">
        <h2
          onClick={() => setTableOpen(!isTableOpen)}
          className="history-title"
        >
          تاریخچه واریز
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

export default DepositPage;
