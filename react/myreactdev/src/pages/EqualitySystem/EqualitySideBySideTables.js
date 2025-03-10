// SideBySideEqualityTables.jsx
import React from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@mui/material";
import { splitUsersBySide } from "./roleUtils";

/**
 * این کامپوننت سه جدول کنار هم نشان می‌دهد:
 *  1) سمت شرکت
 *  2) سمت کاربران
 *  3) کاربرانی که دخالت ندارند
 *
 * برای هر ارز، ستون‌های Balance, Debt, Credit, LoanAmount ایجاد می‌کند.
 * اگر در سیستم چند ارز (مثلاً "TOMAN", "USDT", "EUR", ...) داریم، همه را
 * به شکل دینامیک شناسایی کرده و ستون‌هایی با پسوند آن ارز می‌سازد.
 *
 * props:
 *  - usersData: آرایه کاربران ( [{FirstName, LastName, roles, balances:[{CurrencyType, Balance, Debt,...},...]}, ...] )
 */

const SideBySideEqualityTables = ({ usersData = [] }) => {
  // 1) تقسیم به companyArray, userArray, excludedArray
  const { companyArray, userArray, excludedArray } =
    splitUsersBySide(usersData);

  // 2) شناسایی همهٔ ارزهای موجود (بر اساس balances)
  const allCurrencies = new Set(); // مثلاً {"TOMAN", "USDT", ...}
  usersData.forEach((user) => {
    (user.balances || []).forEach((b) => {
      if (b.CurrencyType) {
        allCurrencies.add(b.CurrencyType.toUpperCase());
      }
    });
  });
  const currencyList = Array.from(allCurrencies);

  // 3) یک تابع کمکی برای ساخت دادهٔ جدول (با ستون‌های متعدد)
  // هر سطر: [UserName, Role, ... + {Balance_ارز}, {Debt_ارز}, {Credit_ارز}, {Loan_ارز},...]
  function buildTableData(userArray) {
    return userArray.map((user) => {
      const row = {
        UserName: `${user.FirstName || ""} ${user.LastName || ""}`.trim(),
        Role: (user.roles || []).join(", "),
      };

      // برای هر ارز در currencyList، مقادیر (Balance, Debt, Credit, LoanAmount) را می‌گیریم
      currencyList.forEach((cur) => {
        const b =
          (user.balances || []).find(
            (bb) => (bb.CurrencyType || "").toUpperCase() === cur
          ) || {};
        row[`Balance_${cur}`] = b.Balance || 0;
        row[`Debt_${cur}`] = b.Debt || 0;
        row[`Credit_${cur}`] = b.Credit || 0;
        row[`Loan_${cur}`] = b.LoanAmount || 0;
      });
      return row;
    });
  }

  // 4) ساخت دادهٔ سه گروه
  const companyData = buildTableData(companyArray);
  const userData = buildTableData(userArray);
  const excludedData = buildTableData(excludedArray);

  // 5) ستون‌های اصلی بدون ارز: UserName, Role
  const baseColumns = ["UserName", "Role"];

  // 6) ستون‌های ارزی: برای هر ارز 4 ستون: (Balance_cur, Debt_cur, Credit_cur, Loan_cur)
  // نام فارسی یا label را هم می‌توانید تغییردهید.
  const dynamicColumns = [];
  currencyList.forEach((cur) => {
    dynamicColumns.push(`Balance_${cur}`);
    dynamicColumns.push(`Debt_${cur}`);
    dynamicColumns.push(`Credit_${cur}`);
    dynamicColumns.push(`Loan_${cur}`);
  });

  // همه ستون‌های جدول
  const allColumns = [...baseColumns, ...dynamicColumns];

  // 7) محاسبه جمع کل در پایین هر جدول
  function calcSums(data) {
    // شیء که کلیدش نام ستون و مقدارش مجموع است
    const sums = {};
    allColumns.forEach((col) => {
      sums[col] = 0;
    });
    data.forEach((row) => {
      allColumns.forEach((col) => {
        // اگر مقدار عددی باشد
        const val = row[col];
        if (typeof val === "number") {
          sums[col] += val;
        }
      });
    });
    return sums;
  }

  const sumsCompany = calcSums(companyData);
  const sumsUser = calcSums(userData);
  const sumsExcluded = calcSums(excludedData);

  // تابع برای رندر جدول
  function renderTable(title, dataRows, sumObj) {
    if (dataRows.length === 0) {
      return (
        <Paper sx={{ p: 2, mb: 2, maxHeight: 400, overflow: "auto" }}>
          <Typography variant="subtitle1" gutterBottom>
            {title}
          </Typography>
          <Typography color="text.secondary">هیچ رکوردی وجود ندارد</Typography>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 2, mb: 2, maxHeight: 400, overflow: "auto" }}>
        <Typography variant="subtitle1" gutterBottom>
          {title}
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              {allColumns.map((col) => (
                <TableCell key={col} align="center">
                  {columnLabel(col)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataRows.map((row, idx) => (
              <TableRow key={idx}>
                {allColumns.map((col) => {
                  const val = row[col];
                  return (
                    <TableCell key={col} align="center">
                      {typeof val === "number" ? val : val || ""}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
            {/* ردیف جمع */}
            <TableRow>
              {allColumns.map((col, i) => {
                let content = "";
                if (i === 0) content = "مجموع کل";
                if (typeof sumObj[col] === "number") {
                  content = sumObj[col];
                }
                return (
                  <TableCell
                    key={col}
                    align="center"
                    sx={{ fontWeight: "bold" }}
                  >
                    {content}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    );
  }

  // تابع کمکی برای نمایش نام ستون به فارسی
  function columnLabel(colKey) {
    // baseColumns
    if (colKey === "UserName") return "نام کاربر";
    if (colKey === "Role") return "نقش(ها)";

    // dynamic columns
    // نمونه: "Balance_TOMAN" => ["Balance", "TOMAN"]
    const [field, cur] = colKey.split("_");
    if (field === "Balance") return `موجودی(${cur})`;
    if (field === "Debt") return `بدهی(${cur})`;
    if (field === "Credit") return `بستانکاری(${cur})`;
    if (field === "Loan") return `وام(${cur})`;

    return colKey;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <Grid container spacing={2}>
        {/* ستون چپ: سمت شرکت */}
        <Grid item xs={12} md={4}>
          {renderTable("سمت شرکت", companyData, sumsCompany)}
        </Grid>

        {/* ستون وسط: سمت کاربران */}
        <Grid item xs={12} md={4}>
          {renderTable("سمت کاربران", userData, sumsUser)}
        </Grid>

        {/* ستون راست: excluded */}
        <Grid item xs={12} md={4}>
          {renderTable("خارج از محاسبات", excludedData, sumsExcluded)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default SideBySideEqualityTables;
