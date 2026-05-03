import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';
import BASE_URL from '../../api';

const SignUp = () => {
  const [form, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    adminKey: ""   // 👑 OPTIONAL (for admin signup)
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
          adminKey   // 👑 sent only if filled
        },
        { headers: { "Content-Type": "application/json" } }
      );

      const result = response?.data;

      // ❌ If registration failed
      if (!result || !result.auth) {
        alert("Registration failed. Please try again.");
        return;
      }

      // ✅ Save user
      localStorage.setItem("user", JSON.stringify(result.user));

      // ✅ Save token (IMPORTANT: no JSON.stringify)
      localStorage.setItem("token", result.auth);

      // 👑 AUTO REDIRECT BASED ON ROLE
      if (result.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }

    } catch (err) {
      console.error("Register error:", err);
      const message = err?.response?.data?.message || "Registration failed";
      alert(message); // Will now show "Invalid admin key" or "An admin already exists"
    }
  };

  return (
    <div className='register'>
      <h1 style={{ marginLeft: "25px" }}>Register</h1>

      <div className='auth-container'>

        <div className="field-group">
          <label className="field-label">Name</label>
          <input
            className='inputBox'
            type='text'
            name='name'
            placeholder='Enter Name'
            value={form.name}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Email</label>
          <input
            className='inputBox'
            type='text'
            name='email'
            placeholder='Enter Email'
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="field-group">
          <label className="field-label">Password</label>
          <input
            className='inputBox'
            type='password'
            name='password'
            placeholder='Enter Password'
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {/* 👑 OPTIONAL ADMIN KEY FIELD */}
        <div className="field-group">
          <label className="field-label">Admin Key (optional)</label>
          <input
            className='inputBox'
            type='text'
            name='adminKey'
            placeholder='Enter Admin Key (only for admin signup)'
            value={form.adminKey}
            onChange={handleChange}
          />
        </div>

        <button
          onClick={collectData}
          type='button'
          className='appButton'
        >
          Sign Up
        </button>

      </div>
    </div>
  );
};

export default SignUp;