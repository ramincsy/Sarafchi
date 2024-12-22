import React, { useState } from "react";
import JibitService from "../services/jibitService";
import InquiryTable from "../components/InquiryTable";
import { getUserID } from "../utils/userUtils";

const CardToIban = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const isValidCardNumber = (cardNumber) => {
    const regex = /^[0-9]{16}$/; // شماره کارت باید ۱۶ رقمی باشد
    return regex.test(cardNumber);
  };

  const handleCardToIban = async () => {
    const user_id = getUserID();

    if (!user_id) {
      setError("User ID not found. Please log in.");
      return;
    }

    if (!cardNumber) {
      setError("Card number is required.");
      return;
    }

    if (!isValidCardNumber(cardNumber)) {
      setError("Invalid card number format. It must be a 16-digit number.");
      return;
    }

    try {
      const data = await JibitService.cardToIban(cardNumber, user_id);
      console.log("Response Data:", data); // لاگ داده‌های بازگشتی
      setResponse(data);
      setError(null);
    } catch (err) {
      console.error("Error during Card to IBAN inquiry:", err);
      setError(err);
      setResponse(null);
    }
  };

  return (
    <div>
      <h3>Card to IBAN</h3>
      <input
        type="text"
        placeholder="Enter Card Number"
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
      />
      <button onClick={handleCardToIban}>Submit</button>
      {response && <InquiryTable data={response} />}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

export default CardToIban;
