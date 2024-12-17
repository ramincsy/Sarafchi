import React, { useState, useEffect } from "react";
import "./BalancesPage.css";

const BalancesPage = () => {
  const [balances, setBalances] = useState([]);
  const [summary, setSummary] = useState({
    debtCredit: null,
    locked: null,
    withdrawable: null,
    loanRemaining: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
  // تابع برای خواندن user_id از localStorage

  const fetchBalances = async () => {
    const user_id = getUserID();

    if (!user_id) {
      setError("User ID not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://127.0.0.1:5000/api/balances/${user_id}`
      );
      const data = await response.json();
      console.log(data);

      if (data.success) {
        // کارت‌های پیش‌فرض
        const defaultCurrencies = ["IRR", "USD", "USDT"];

        // موجودی ارزها از API
        const apiBalances = data.balances.filter((b) => b.NetBalance > 0);

        // ادغام کارت‌های پیش‌فرض
        const defaultBalances = defaultCurrencies.map((currency) => {
          const match = apiBalances.find((b) => b.CurrencyType === currency);
          return match || { CurrencyType: currency, NetBalance: 0 };
        });

        // اضافه کردن ارزهای دیگر
        const additionalBalances = apiBalances.filter(
          (b) => !defaultCurrencies.includes(b.CurrencyType)
        );

        setBalances([...defaultBalances, ...additionalBalances]);

        // تنظیم داده‌های خلاصه
        setSummary({
          debtCredit: data.summary.total_net_balance || null,
          locked: data.summary.total_locked_balance || null,
          withdrawable: data.summary.total_withdrawable_balance || null,
          loanRemaining:
            apiBalances.reduce((acc, b) => acc + (b.LoanBalance || 0), 0) ||
            null,
        });
      } else {
        throw new Error(data.error || "Failed to fetch balances");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="balances-page">
      <h1>وضعیت مالی</h1>

      {/* کارت‌های موجودی */}
      <div className="balances-container">
        {balances.map((balance, index) => (
          <div
            key={index}
            className={`balance-box balance-${balance.CurrencyType.toLowerCase()}`}
          >
            <h3>موجودی {balance.CurrencyType}</h3>
            <p>
              {balance.NetBalance !== null
                ? `${balance.NetBalance.toLocaleString()} ${
                    balance.CurrencyType
                  }`
                : "null"}
            </p>
          </div>
        ))}
      </div>

      {/* کارت‌های خلاصه */}
      <div className="balances-container">
        <div className="balance-box balance-debt-credit">
          <h3>بدهکار / بستانکار</h3>
          <p>
            {summary.debtCredit !== null
              ? `${summary.debtCredit.toLocaleString()} تومان`
              : "null"}
          </p>
        </div>
        <div className="balance-box balance-locked">
          <h3>موجودی قفل شده</h3>
          <p>
            {summary.locked !== null
              ? `${summary.locked.toLocaleString()} تومان`
              : "null"}
          </p>
        </div>
        <div className="balance-box balance-withdrawable">
          <h3>موجودی قابل برداشت</h3>
          <p>
            {summary.withdrawable !== null
              ? `${summary.withdrawable.toLocaleString()} تومان`
              : "null"}
          </p>
        </div>
        <div className="balance-box balance-loan">
          <h3>مانده وام</h3>
          <p>
            {summary.loanRemaining !== null
              ? `${summary.loanRemaining.toLocaleString()} تومان`
              : "null"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BalancesPage;
