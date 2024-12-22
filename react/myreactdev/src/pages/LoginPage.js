import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import AuthContext from "../contexts/AuthContext";
import UserService from "../services/UserService";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuthToken, setUserInfo } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const data = await UserService.login(email, password);

      // ذخیره اطلاعات کاربر در localStorage
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem(
        "user_info",
        JSON.stringify({
          user_id: data.user_id,
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          roles: data.roles, // نقش‌ها
          permissions: data.permissions, // مجوزها
          pages: data.pages, // صفحات
          access_token_expiry: data.access_token_expiry,
          refresh_token_expiry: data.refresh_token_expiry,
        })
      );

      // ذخیره اطلاعات در context برای دسترسی در سایر صفحات
      setAuthToken(data.access_token);
      setUserInfo({
        user_id: data.user_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        roles: data.roles,
        permissions: data.permissions,
        pages: data.pages,
      });

      // انتقال به صفحه اصلی یا صفحه قبلی
      navigate("/");
    } catch (err) {
      setError(err || "مشکلی در ورود رخ داده است. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h2>ورود به حساب کاربری</h2>
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label>ایمیل:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ایمیل خود را وارد کنید"
            required
          />
        </div>
        <div className="form-group">
          <label>رمز عبور:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="رمز عبور خود را وارد کنید"
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button" disabled={isLoading}>
          {isLoading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
