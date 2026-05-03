// pages/PaymentPage/PaymentPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import BASE_URL from "../../api";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { id } = useParams();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a screenshot");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      await axios.post(
        `${BASE_URL}/order/upload-payment/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Payment submitted! Wait for admin approval.");
    } catch (err) {
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">

      <div className="payment-card">

        {/* ── Header ── */}
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h2 className="payment-title">Manual Payment</h2>
          <p className="payment-subtitle">
            Send payment to the account below and upload your screenshot
          </p>
        </div>

        {/* ── Account Info ── */}
        <div className="payment-account-box">
          <div className="account-row">
            <span className="account-label">📱 JazzCash</span>
            <span className="account-number">0300-1234567</span>
          </div>
          <div className="account-divider" />
          <div className="account-row">
            <span className="account-label">💚 Easypaisa</span>
            <span className="account-number">0300-1234567</span>
          </div>
        </div>

        {/* ── Upload Area ── */}
        <div className="upload-section">
          <p className="upload-label">Upload Payment Screenshot</p>

          <label className="upload-dropzone" htmlFor="screenshot-input">
            {preview ? (
              <img src={preview} alt="Preview" className="upload-preview" />
            ) : (
              <>
                <span className="upload-dropzone-icon">📁</span>
                <span className="upload-dropzone-text">
                  Click to select screenshot
                </span>
                <span className="upload-dropzone-sub">
                  JPG, PNG, JPEG supported
                </span>
              </>
            )}
          </label>

          <input
            id="screenshot-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="upload-input-hidden"
          />

          {file && (
            <p className="upload-filename">📎 {file.name}</p>
          )}
        </div>

        {/* ── Submit Button ── */}
        <button
          className={`payment-submit-btn ${loading ? "loading" : ""}`}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" /> Uploading...
            </>
          ) : (
            "Submit Payment"
          )}
        </button>

        <p className="payment-note">
          ⏳ Your order will be confirmed after admin approval
        </p>

      </div>
    </div>
  );
};

export default PaymentPage;