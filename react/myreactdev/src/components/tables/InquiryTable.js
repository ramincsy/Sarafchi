// استفاده از کامپوننت مشترک برای جدول نمایش داده‌ها:
// src/components/InquiryTable.js
import React from "react";

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

export default InquiryTable;
