import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../contexts/AuthContext";

const SubHeader = () => {
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

  const [exchangeRates, setExchangeRates] = useState({
    USD: 0,
    EUR: 0,
    IRR: 0,
  });
  const [balances, setBalances] = useState({
    USD: 0,
    EUR: 0,
    IRR: 0,
  });

  useEffect(() => {
    // Fetch exchange rates
    fetch("http://localhost:5000/api/exchange-rates")
      .then((response) => response.json())
      .then((data) => setExchangeRates(data))
      .catch((error) => console.error("Error fetching exchange rates:", error));

    // Fetch balances با استفاده از currentUserID
    if (currentUserID) {
      fetch(`http://localhost:5000/api/balances/${currentUserID}`)
        .then((response) => response.json())
        .then((data) => setBalances(data))
        .catch((error) => console.error("Error fetching balances:", error));
    }
  }, [currentUserID]);

  return (
    <div className="subheader">
      <div className="subheader-item">
        <strong>دلار:</strong> {exchangeRates.USD} | موجودی: {balances.USD}
      </div>
      <div className="subheader-item">
        <strong>یورو:</strong> {exchangeRates.EUR} | موجودی: {balances.EUR}
      </div>
      <div className="subheader-item">
        <strong>ریال:</strong> {exchangeRates.IRR} | موجودی: {balances.IRR}
      </div>
    </div>
  );
};

export default SubHeader;
