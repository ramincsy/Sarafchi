import React, { useState } from "react";
import axios from "axios";

const IbanInquiry = () => {
  const [iban, setIban] = useState("");
  const [response, setResponse] = useState(null);
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

  // کپی کردن داده‌ها به کلیپ‌بورد
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert(`کپی شد: ${text}`);
  };

  const handleIbanInquiry = async () => {
    const user_id = getUserID(); // خواندن user_id از localStorage

    if (!user_id) {
      setError("User ID not found. Please log in.");
      return;
    }

    if (!iban) {
      setError("IBAN is required.");
      return;
    }

    try {
      const res = await axios.get(
        "http://127.0.0.1:5000/api/jibit/iban-inquiry",
        {
          params: { iban, user_id }, // ارسال user_id
        }
      );
      setResponse(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "An unexpected error occurred");
      setResponse(null);
    }
  };

  return (
    <div style={{ marginBottom: "20px", direction: "rtl", textAlign: "right" }}>
      <h3>استعلام شماره شبا</h3>
      <input
        type="text"
        placeholder="شماره شبا را وارد کنید"
        value={iban}
        onChange={(e) => setIban(e.target.value)}
        style={{ marginRight: "10px", padding: "5px" }}
      />
      <button onClick={handleIbanInquiry} style={{ padding: "5px 10px" }}>
        ارسال
      </button>

      {/* نمایش اطلاعات در جدول */}
      <div style={{ marginTop: "20px" }}>
        {response ? (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "10px",
            }}
          >
            <thead>
              <tr>
                <th style={styles.th}>شماره شبا</th>
                <th style={styles.th}>نام کامل صاحب حساب</th>
                <th style={styles.th}>نام بانک</th>
                <th style={styles.th}>وضعیت حساب</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={styles.td} onClick={() => handleCopy(response.iban)}>
                  {response.iban}
                </td>
                <td
                  style={styles.td}
                  onClick={() =>
                    handleCopy(
                      `${response.bank_info.first_name} ${response.bank_info.last_name}`
                    )
                  }
                >
                  {response.bank_info.first_name} {response.bank_info.last_name}
                </td>
                <td
                  style={styles.td}
                  onClick={() => handleCopy(response.bank_info.bank)}
                >
                  {response.bank_info.bank}
                </td>
                <td
                  style={styles.td}
                  onClick={() => handleCopy(response.bank_info.status)}
                >
                  {response.bank_info.status}
                </td>
              </tr>
            </tbody>
          </table>
        ) : error ? (
          <div style={{ color: "red", marginTop: "10px" }}>
            <h4>خطا:</h4>
            <p>{error}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// استایل‌های ساده برای جدول
const styles = {
  th: {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#f4f4f4",
    textAlign: "center",
  },
  td: {
    border: "1px solid #ccc",
    padding: "8px",
    cursor: "pointer",
    textAlign: "center",
  },
};

export default IbanInquiry;
