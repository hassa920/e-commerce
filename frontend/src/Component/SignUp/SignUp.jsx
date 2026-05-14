import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import BASE_URL from "../../api";

const SignUp = () => {
  const [form, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminKey: "",
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

  const collectData = async () => {
    const { name, email, password, adminKey } = form;

    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/register`,
        {
          name,
          email,
          password,
          adminKey,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = response?.data;
      const token = result?.token || result?.auth;

      if (!result || !token) {
        alert("Registration failed");
        return;
      }

      localStorage.setItem(
        "user",
        JSON.stringify({
          token: token,
          user: result.user,
        })
      );

      if (result.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/products");
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || "Registration failed";
      alert(message);
    }
  };

  return (
    <div className="register-page">

      {/* LEFT INFO PANEL */}
      <div className="register-left">
        <div className="brand">⚡ QuickCommerce</div>

        <h1>Create your account</h1>

        <p className="subtitle">
          Start your journey with fast, secure, and reliable online shopping.
        </p>

        {/* USP */}
        <div className="usp-box">
          <h3>Why choose us</h3>
          <ul>
            <li>⚡ Fast checkout</li>
            <li>🔒 Secure payments</li>
            <li>📦 Reliable delivery</li>
            <li>📊 Smooth order tracking</li>
          </ul>
        </div>

        {/* ICP */}
        <div className="icp-box">
          <h3>Perfect for</h3>
          <p>Students • Small Business Owners • Online Shoppers</p>
        </div>

        <div className="trust">
          ✔ Trusted by hundreds of users across Pakistan
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="register-right">
        <div className="register">

          <h1>Sign Up</h1>

          <div className="auth-container">

            <div className="field-group">
              <label>Name</label>
              <input
                className="inputBox"
                type="text"
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Email</label>
              <input
                className="inputBox"
                type="text"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Password</label>
              <input
                className="inputBox"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            <div className="field-group">
              <label>Admin Key (optional)</label>
              <input
                className="inputBox"
                type="text"
                name="adminKey"
                placeholder="Enter admin key"
                value={form.adminKey}
                onChange={handleChange}
              />
            </div>

            <button onClick={collectData} >
              Create Account
            </button>

            <p className="link">
              Already have an account?
              <span onClick={() => navigate("/login")}> Login</span>
            </p>

          </div>
        </div>
      </div>

    </div>
  );
};

export default SignUp;