import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import BASE_URL from "../../api";

const Login = () => {
  const [form, setFormData] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const auth = localStorage.getItem("user");
    if (auth) {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    const { email, password } = form;

    if (!email.trim() || !password.trim()) {
      alert("Please enter email and password");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      const result = response?.data;
      const token = result?.token || result?.auth;

      if (!result || !token) {
        alert("Invalid credentials");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          token: result.token,
          user: result.user,
        })
      );

      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="login-page">

      {/* LEFT INFO PANEL */}
      <div className="login-left">
        <div className="brand">⚡ QuickCommerce</div>

        <h1>
          Fast, Secure & Reliable <br />
          Online Shopping
        </h1>

        <p className="subtitle">
          Built for modern shoppers in Pakistan who want speed, trust, and
          simplicity.
        </p>

        <div className="usp-box">
          <h3>Why users love us</h3>
          <ul>
            <li>⚡ Fast checkout experience</li>
            <li>🔒 Secure payments (JazzCash / Easypaisa / COD)</li>
            <li>📦 Reliable order tracking</li>
            <li>🚚 Smooth delivery system</li>
          </ul>
        </div>

        <div className="icp-box">
          <h3>Perfect for</h3>
          <p>Students • Small Business Owners • Online Shoppers</p>
        </div>

        <div className="trust">
          ✔ Trusted checkout system used by hundreds of users daily
        </div>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div className="login-right">

        <div className="login-card">
          <h2>Welcome back</h2>
          <p className="muted">Login to continue shopping</p>

          {/* EMAIL */}
          <div className="field">
            <label>Email</label>
            <input
              type="text"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD */}
          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
            />
          </div>

          {/* LOGIN BUTTON */}
          <button onClick={handleLogin} className="login-btn">
            Sign in
          </button>

          {/* ✅ SIGNUP OPTION (ADDED) */}
          <div className="signup-link">
            Don’t have an account?
            <span onClick={() => navigate("/signup")}>
              Sign up
            </span>
          </div>

          <p className="footer-text">
            Secure login protected with encrypted authentication
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;