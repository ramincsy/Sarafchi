import React, { createContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(
    localStorage.getItem("access_token") || null
  );
  const [userInfo, setUserInfo] = useState(
    JSON.parse(localStorage.getItem("user_info")) || null
  );

  const logout = () => {
    setAuthToken(null);
    setUserInfo(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
  };

  return (
    <AuthContext.Provider
      value={{ authToken, setAuthToken, userInfo, setUserInfo, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
