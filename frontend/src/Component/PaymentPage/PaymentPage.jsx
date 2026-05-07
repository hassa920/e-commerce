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

  // ✅ SAFE TOKEN (IMPORTANT FIX)
  let token = null;

  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    token = stored?.token;
  } catch {
    token = null;
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  };

  // ================= UPLOAD =================
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a screenshot");
      return;
    }

    if (!token) {
      alert("Please login first");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        `${BASE_URL}/order/upload-payment/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("UPLOAD RESPONSE:", res.data);

      alert("✅ Payment submitted! Wait for admin approval.");
      setFile(null);
      setPreview(null);

    } catch (err) {
      console.log("UPLOAD ERROR:", err?.response?.data || err.message);
      alert(
        err?.response?.data?.message || "Upload failed (check backend)"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="payment-page">

      <div className="payment-card">

        {/* HEADER */}
        <div className="payment-header">
          <div className="payment-icon">💳</div>
          <h2 className="payment-title">Manual Payment</h2>
          <p className="payment-subtitle">
            Send payment and upload screenshot
          </p>
        </div>

        {/* ACCOUNT INFO */}
        <div className="payment-account-box">
          <div className="account-row">
            <span>📱 JazzCash</span>
            <span>0300-1234567</span>
          </div>

          <div className="account-divider" />

          <div className="account-row">
            <span>💚 Easypaisa</span>
            <span>0300-1234567</span>
          </div>
        </div>

        {/* UPLOAD */}
        <div className="upload-section">

          <label htmlFor="file" className="upload-dropzone">
            {preview ? (
              <img src={preview} alt="preview" className="upload-preview" />
            ) : (
              <>
                <span>📁</span>
                <p>Click to upload screenshot</p>
              </>
            )}
          </label>

          <input
            id="file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />

          {file && <p className="upload-filename">{file.name}</p>}
        </div>

        {/* BUTTON */}
        <button
          className="payment-submit-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Submit Payment"}
        </button>

        <p className="payment-note">
          Your order will be reviewed by admin
        </p>

      </div>
    </div>
  );
};

export default PaymentPage;