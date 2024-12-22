import React, { useState } from "react";
import JibitService from "../services/jibitService";
import InquiryTable from "../components/InquiryTable";
import { getUserID } from "../utils/userUtils";

const IbanInquiry = () => {
  const [iban, setIban] = useState("");
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleIbanInquiry = async () => {
    const user_id = getUserID();

    if (!user_id) {
      setError("User ID not found. Please log in.");
      return;
    }

    if (!iban) {
      setError("IBAN is required.");
      return;
    }

    // اضافه کردن پیشوند IR به شماره شبا
    const formattedIban = `IR${iban}`;

    try {
      const data = await JibitService.ibanInquiry(formattedIban, user_id);
      setResponse(data);
      setError(null);
    } catch (err) {
      setError(err);
      setResponse(null);
    }
  };

  return (
    <div>
      <h3>IBAN Inquiry</h3>
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontWeight: "bold", marginRight: "5px" }}>IR</span>
        <input
          type="text"
          placeholder="Enter IBAN without IR"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          style={{ flex: 1, padding: "5px" }}
        />
      </div>
      <button onClick={handleIbanInquiry} style={{ marginTop: "10px" }}>
        Submit
      </button>
      {response && <InquiryTable data={response} />}
      {error && <div style={{ color: "red", marginTop: "10px" }}>{error}</div>}
    </div>
  );
};

export default IbanInquiry;
