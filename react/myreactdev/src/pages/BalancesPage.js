import React, { useState, useMemo } from "react";
import "./BalancesPage.css";
import { useTable, useGlobalFilter } from "react-table";

// Mock transaction data
const mockData = [
  { id: 1, type: "واریز", amount: 1000, currency: "USD", date: "2024-12-01" },
  { id: 2, type: "برداشت", amount: 500, currency: "IRR", date: "2024-12-01" },
  { id: 3, type: "واریز", amount: 700, currency: "USDT", date: "2024-12-02" },
  { id: 4, type: "برداشت", amount: 300, currency: "IRR", date: "2024-12-02" },
];

const BalancesPage = () => {
  const [balances] = useState({
    toman: 5000000,
    usd: 2000,
    usdt: 1500,
    debtCredit: -200,
    locked: 1000,
    withdrawable: 3500,
    loanRemaining: 5000,
  });

  const columns = useMemo(
    () => [
      { Header: "شناسه", accessor: "id" },
      { Header: "نوع", accessor: "type" },
      { Header: "مقدار", accessor: "amount" },
      { Header: "ارز", accessor: "currency" },
      { Header: "تاریخ", accessor: "date" },
    ],
    []
  );

  const data = useMemo(() => mockData, []);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
  } = useTable({ columns, data }, useGlobalFilter);

  return (
    <div className="balances-page">
      <h1>وضعیت مالی</h1>
      <div className="balances-container">
        <div className="balance-box balance-toman">
          <h3>موجودی تومان</h3>
          <p>{balances.toman.toLocaleString()} تومان</p>
        </div>
        <div className="balance-box balance-usd">
          <h3>موجودی دلار</h3>
          <p>{balances.usd.toLocaleString()} USD</p>
        </div>
        <div className="balance-box balance-usdt">
          <h3>موجودی تتر</h3>
          <p>{balances.usdt.toLocaleString()} USDT</p>
        </div>
        <div className="balance-box balance-debt-credit">
          <h3>بدهکار / بستانکار</h3>
          <p>{balances.debtCredit.toLocaleString()} تومان</p>
        </div>
        <div className="balance-box balance-locked">
          <h3>موجودی قفل شده</h3>
          <p>{balances.locked.toLocaleString()} تومان</p>
        </div>
        <div className="balance-box balance-withdrawable">
          <h3>موجودی قابل برداشت</h3>
          <p>{balances.withdrawable.toLocaleString()} تومان</p>
        </div>
        <div className="balance-box balance-loan">
          <h3>مانده وام</h3>
          <p>{balances.loanRemaining.toLocaleString()} تومان</p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-section">
        <h2>واریز / برداشت</h2>
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
    </div>
  );
};

export default BalancesPage;
