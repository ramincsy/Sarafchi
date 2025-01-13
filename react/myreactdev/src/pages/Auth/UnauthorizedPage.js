import { useLocation } from "react-router-dom";

const Unauthorized = () => {
  const location = useLocation();
  const userInfo = location.state?.userInfo || {};

  const userId = userInfo?.UserID || "Unknown User";

  return (
    <div>
      <h1>Unauthorized Access</h1>
      <p>User ID: {userId}</p>
      <pre>{JSON.stringify(userInfo, null, 2)}</pre>
    </div>
  );
};

export default Unauthorized;
