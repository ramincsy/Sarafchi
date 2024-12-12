import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import AuthContext from "../contexts/AuthContext";

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
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ارسال کوکی‌ها
      });

      if (response.ok) {
        const data = await response.json();

        // ذخیره اطلاعات کاربر در localStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        localStorage.setItem(
          "user_info",
          JSON.stringify({
            user_id: data.user_id,
            name: data.name,
            email: data.email,
            access_token_expiry: data.access_token_expiry,
            refresh_token_expiry: data.refresh_token_expiry,
          })
        );

        // ذخیره اطلاعات در context برای دسترسی در سایر صفحات
        setAuthToken(data.access_token);
        setUserInfo({
          user_id: data.user_id,
          name: data.name,
          email: data.email,
        });

        // انتقال به صفحه اصلی یا صفحه قبلی
        navigate("/");
      } else if (response.status === 401) {
        setError("ایمیل یا رمز عبور نادرست است.");
      } else {
        setError("خطایی رخ داده است. لطفاً دوباره تلاش کنید.");
      }
    } catch (err) {
      setError("مشکلی در برقراری ارتباط با سرور وجود دارد.");
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
