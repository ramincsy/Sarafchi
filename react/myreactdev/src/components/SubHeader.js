import React, { useState, useEffect } from "react";

const SubHeader = () => {
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

  const currentUserID = getUserID();
  const [balances, setBalances] = useState({
    USD: 0,
    EUR: 0,
    IRR: 0,
  });

  useEffect(() => {
    if (currentUserID) {
      fetch(`http://localhost:5000/api/balances/${currentUserID}`)
        .then((response) => response.json())
        .then((data) => {
          console.log("Received balances:", data); // برای تست

          // بررسی اگر داده‌ها موفق بودند و شامل balances بودند
          if (data.success && Array.isArray(data.balances)) {
            const apiBalances = data.balances;

            const parsedBalances = {
              USD: getNetBalance(apiBalances, "USD"),
              EUR: getNetBalance(apiBalances, "EUR"),
              IRR: getNetBalance(apiBalances, "IRR"),
            };

            setBalances(parsedBalances);
          } else {
            console.error("Unexpected API response structure:", data);
          }
        })
        .catch((error) => console.error("Error fetching balances:", error));
    }
  }, [currentUserID]);

  // تابع برای استخراج NetBalance از داده‌های balances
  const getNetBalance = (balancesArray, currencyType) => {
    const balance = balancesArray.find(
      (item) => item.CurrencyType === currencyType
    );
    return balance ? balance.NetBalance : 0;
  };

  return (
    <div className="subheader" style={{ display: "flex", gap: "20px" }}>
      <div className="subheader-item">
        <strong>موجودی دلار:</strong> {balances.USD.toLocaleString()} USD
      </div>
      <div className="subheader-item">
        <strong>موجودی یورو:</strong> {balances.EUR.toLocaleString()} EUR
      </div>
      <div className="subheader-item">
        <strong>موجودی ریال:</strong> {balances.IRR.toLocaleString()} IRR
      </div>
    </div>
  );
};

export default SubHeader;
