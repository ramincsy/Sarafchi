import React from "react";
import CardToIban from "components/common/jibit/CardToIban";
import IbanInquiry from "components/common/jibit/IbanInquiry";
import { getUserID } from "utils/userUtils";

const JibitPage = () => {
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
