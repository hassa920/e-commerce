import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import BASE_URL from '../../api';

const Login = () => {
  const [form, setFormData] = useState({
    email: "",
    password: ""
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
          withCredentials: true
        }
      );

      const result = response?.data;

      // ❌ If login failed
      if (!result || !result.auth) {
        alert("Invalid credentials");
        return;
      }

      // ✅ Save user and token
      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("token", result.auth);

      // 👑 AUTO REDIRECT BASED ON ROLE (YOUR ADDED LOGIC)
      if (result.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Login error:", err);
      alert("Invalid credentials");
    }
  };

  return (
    <div className='login'>
      <h1 style={{ marginLeft: "25px" }}>Login</h1>

      <div className='auth-container'>

        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            type='text'
            placeholder='Enter email'
            name='email'
            value={form.email}
            onChange={handleChange}
            className='inputBox'
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <input
            type='password'
            placeholder='Enter password'
            name='password'
            value={form.password}
            onChange={handleChange}
            className='inputBox'
          />
        </div>

        <button
          type='button'
          onClick={handleLogin}
          className='appButton'
        >
          Login
        </button>

      </div>
    </div>
  );
};

export default Login;