// ManageUserFinancial.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Paper,
  Alert,
} from "@mui/material";

import UserService from "services/UserService";
import FinancialOpsService from "services/FinancialOpsService";

function ManageUserFinancial() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  // انتخاب ارز
  const [currency, setCurrency] = useState("Toman"); // پیشفرض IRR
  // اگر دوست دارید لیست ارزها را ثابت تعریف کنید یا از API بگیرید
  const currencyList = ["Toman", "USD", "USDT", "EUR"];

  const [operations, setOperations] = useState([]);
  const [lastStatus, setLastStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // فرم ایجاد عملیات
  const [operationType, setOperationType] = useState("Charge");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  // 1) هنگام بارگذاری صفحه، لیست کاربران را می‌گیریم
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const data = await UserService.fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setErrorMsg(typeof err === "string" ? err : "خطا در دریافت لیست کاربران");
    }
  };

  // وقتی کاربر را عوض کردیم
  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setErrorMsg("");
    setSuccessMsg("");
    setOperationType("Charge");
    setAmount("");
    setReason("");

    if (!user) {
      setLastStatus(null);
      setOperations([]);
      return;
    }

    // دریافت آخرین وضعیت و تاریخچه برای این کاربر + ارز انتخابی
    fetchLastStatus(user.ID, currency);
    fetchOperations(user.ID, currency);
  };

  // تغییر ارز
  const handleSelectCurrency = async (newCurrency) => {
    setCurrency(newCurrency);

    // اگر کاربر هم انتخاب شده باشد، داده‌ها را رفرش می‌کنیم
    if (selectedUser) {
      fetchLastStatus(selectedUser.ID, newCurrency);
      fetchOperations(selectedUser.ID, newCurrency);
    }
  };

  const fetchLastStatus = async (userId, cur) => {
    try {
      const status = await FinancialOpsService.fetchLastStatus(userId, cur);
      setLastStatus(status);
    } catch (err) {
      setLastStatus(null);
    }
  };

  const fetchOperations = async (userId, cur) => {
    try {
      const ops = await FinancialOpsService.fetchOperations(userId, cur);
      setOperations(ops);
    } catch (error) {
      setErrorMsg("خطا در دریافت تاریخچه مالی");
    }
  };

  // 3) افزودن عملیات جدید
  const handleAddOperation = async () => {
    if (!selectedUser) {
      setErrorMsg("ابتدا کاربر را انتخاب کنید");
      return;
    }
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // در این جا currency_type را هم ارسال می‌کنیم
      await FinancialOpsService.addOperation({
        user_id: selectedUser.ID,
        currency_type: currency, // ارز انتخاب‌شده
        operation_type: operationType,
        amount: parseFloat(amount),
        reason: reason,
        update_source: "Manual",
        updated_by: 1, // در سیستم واقعی از توکن می‌گیرید
      });
      setSuccessMsg("عملیات با موفقیت ثبت شد");
      // رفرش لیست و وضعیت
      fetchOperations(selectedUser.ID, currency);
      fetchLastStatus(selectedUser.ID, currency);
      // خالی‌کردن فرم
      setAmount("");
      setReason("");
      setOperationType("Charge");
    } catch (error) {
      console.error(error);
      setErrorMsg("خطا در ثبت عملیات مالی");
    }
  };

  // 4) بازگردانی (Revert)
  const handleRevertOperation = async (op) => {
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await FinancialOpsService.revertOperation(op.OperationID, {
        reverted_by: 2,
        reason: "بازگشت به درخواست ادمین",
      });
      setSuccessMsg(`عملیات ${op.OperationID} بازگردانی شد`);
      if (selectedUser) {
        fetchLastStatus(selectedUser.ID, currency);
        fetchOperations(selectedUser.ID, currency);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("خطا در بازگردانی عملیات");
    }
  };

  const handleClearAll = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const result = await FinancialOpsService.clearAllOperations();
      setSuccessMsg(result.message || "تمام رکوردها حذف شدند.");
      // وضعیت و لیست را خالی کنیم
      setLastStatus(null);
      setOperations([]);
    } catch (err) {
      setErrorMsg(
        typeof err === "string" ? err : "خطا در پاک‌کردن کل عملیات مالی"
      );
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        مدیریت مالی کاربران
      </Typography>

      {errorMsg && <Alert severity="error">{errorMsg}</Alert>}
      {successMsg && <Alert severity="success">{successMsg}</Alert>}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Box>
          <Button variant="outlined" color="error" onClick={handleClearAll}>
            پاک‌کردن همه عملیات
          </Button>

          <Typography variant="h6" sx={{ mt: 2 }}>
            انتخاب کاربر:
          </Typography>
          <Select
            size="small"
            value={selectedUser ? selectedUser.ID : ""}
            onChange={(e) => {
              const userId = e.target.value;
              const userObj = users.find((u) => u.ID === userId);
              handleSelectUser(userObj);
            }}
            sx={{ minWidth: 200, mt: 1 }}
          >
            <MenuItem value="">
              <em>-- کاربر را انتخاب کنید --</em>
            </MenuItem>
            {users.map((u) => (
              <MenuItem key={u.ID} value={u.ID}>
                {u.FirstName} {u.LastName} (ID: {u.ID})
              </MenuItem>
            ))}
          </Select>

          <Typography variant="h6" sx={{ mt: 2 }}>
            انتخاب ارز:
          </Typography>
          <Select
            size="small"
            value={currency}
            onChange={(e) => handleSelectCurrency(e.target.value)}
            sx={{ minWidth: 200, mt: 1 }}
          >
            {currencyList.map((cur) => (
              <MenuItem key={cur} value={cur}>
                {cur}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* نمایش آخرین وضعیت مالی */}
        {selectedUser && (
          <Box>
            <Typography variant="h6">آخرین وضعیت مالی:</Typography>
            {lastStatus ? (
              <Box sx={{ mt: 1 }}>
                <Typography>موجودی: {lastStatus.Balance}</Typography>
                <Typography>
                  موجودی قابل برداشت: {lastStatus.WithdrawableBalance}
                </Typography>
                <Typography>بدهی: {lastStatus.Debt}</Typography>
                <Typography>بستانکاری: {lastStatus.Credit}</Typography>
                <Typography>وام فعلی: {lastStatus.LoanAmount}</Typography>

                {/* نمایش کل وام پرداخت‌شده / بازپرداخت‌شده */}
                {typeof lastStatus.totalLoanGiven !== "undefined" && (
                  <>
                    <Typography>
                      کل وام پرداخت شده: {lastStatus.totalLoanGiven}
                    </Typography>
                    <Typography>
                      کل وام بازپرداخت شده: {lastStatus.totalLoanRepaid}
                    </Typography>
                  </>
                )}
              </Box>
            ) : (
              <Typography sx={{ mt: 1 }}>هنوز رکوردی وجود ندارد</Typography>
            )}
          </Box>
        )}
      </Box>

      {/* بخش ایجاد عملیات جدید */}
      {selectedUser && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            عملیات مالی جدید
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Select
              size="small"
              label="OperationType"
              value={operationType}
              onChange={(e) => setOperationType(e.target.value)}
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="Charge">شارژ</MenuItem>
              <MenuItem value="Withdraw">برداشت</MenuItem>
              <MenuItem value="DebtAdjust">بدهکار کردن</MenuItem>
              <MenuItem value="CreditAdjust">بستانکار کردن</MenuItem>
              <MenuItem value="Loan">وام</MenuItem>
              <MenuItem value="LoanRepayment">بازپرداخت وام</MenuItem>
            </Select>
            <TextField
              label="Amount"
              type="number"
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Reason"
              size="small"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button variant="contained" onClick={handleAddOperation}>
              ثبت عملیات
            </Button>
          </Box>
        </Paper>
      )}

      {/* جدول تاریخچه عملیات */}
      {selectedUser && operations.length > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            تاریخچه عملیات
          </Typography>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                <th>OperationID</th>
                <th>نوع عملیات</th>
                <th>Amount</th>
                <th>موجودی</th>
                <th>برداشتنی</th>
                <th>بدهی</th>
                <th>بستانکاری</th>
                <th>وام</th>
                <th>Status</th>
                <th>تاریخ</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((op) => (
                <tr
                  key={op.OperationID}
                  style={{ borderBottom: "1px solid #ccc" }}
                >
                  <td>{op.OperationID}</td>
                  <td>{op.OperationType}</td>
                  <td>{op.Amount}</td>
                  <td>{op.Balance}</td>
                  <td>{op.WithdrawableBalance}</td>
                  <td>{op.Debt}</td>
                  <td>{op.Credit}</td>
                  <td>{op.LoanAmount}</td>
                  <td>{op.Status}</td>
                  <td>
                    {op.LastUpdated
                      ? new Date(op.LastUpdated).toLocaleString()
                      : ""}
                  </td>
                  <td>
                    {op.Status === "Applied" && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleRevertOperation(op)}
                      >
                        Revert
                      </Button>
                    )}
                    {op.Status === "Reverted" && <span>برگشت شده</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Paper>
      )}
    </Container>
  );
}

export default ManageUserFinancial;
