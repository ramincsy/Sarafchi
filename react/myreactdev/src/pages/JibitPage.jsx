import React, { useState } from "react";
import axios from "axios";

// جدول برای نمایش نتایج
const InquiryTable = ({ data }) => (
  <table
    style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}
  >
    <thead>
      <tr>
        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Field</th>
        <th style={{ border: "1px solid #ddd", padding: "8px" }}>Value</th>
      </tr>
    </thead>
    <tbody>
      {Object.entries(data).map(([key, value], index) => (
        <tr key={index}>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>{key}</td>
          <td style={{ border: "1px solid #ddd", padding: "8px" }}>
            {typeof value === "object" && value !== null ? (
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              value
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// کامپوننت IbanInquiry
const IbanInquiry = ({ userId }) => {
  const [iban, setIban] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleIbanInquiry = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/api/jibit/iban-inquiry",
        {
          params: { iban, user_id: userId },
        }
      );
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred");
    }
  };

  return (
    <div>
      <h3>IBAN Inquiry</h3>
      <input
        type="text"
        placeholder="Enter IBAN"
        value={iban}
        onChange={(e) => setIban(e.target.value)}
      />
      <button onClick={handleIbanInquiry}>Submit</button>
      {response && <InquiryTable data={response} />}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
};

// کامپوننت CardToIban
const CardToIban = ({ userId }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleCardToIban = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/api/jibit/card-to-iban",
        {
          params: { card_number: cardNumber, user_id: userId },
        }
      );
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred");
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

// صفحه JibitPage.jsx
const JibitPage = () => {
  const getUserID = () => {
    try {
      const storedUserInfo = localStorage.getItem("user_info");
      if (storedUserInfo) {
        const { user_id } = JSON.parse(storedUserInfo);
        return user_id;
      }
    } catch (error) {
      console.error("Error reading user_id from localStorage:", error);
    }
    return null;
  };

  const userId = getUserID();

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Jibit API</h1>
      {userId ? (
        <>
          <IbanInquiry userId={userId} />
          <CardToIban userId={userId} />
        </>
      ) : (
        <div style={{ color: "red" }}>User ID not found. Please log in.</div>
      )}
    </div>
  );
};

export default JibitPage;
