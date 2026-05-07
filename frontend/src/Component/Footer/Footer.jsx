import React from "react";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">

      {/* TRUST STRIP */}
      <div className="footer-trust">
        ⚡ Fast Checkout • 🔒 Secure Payments • 📦 Reliable Delivery
      </div>

      <div className="footer-content">

        {/* BRAND */}
        <div className="footer-section footer-brand">
          <h3>⚡ QuickCommerce</h3>
          <p>
            Built for modern shoppers in Pakistan who value speed,
            trust, and simplicity.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-section">
          <h4>Quick Links</h4>
          <Link to="/">Products</Link>
          <Link to="/add">Add Product</Link>
          <Link to="/profile">Profile</Link>
        </div>

        {/* ICP */}
        <div className="footer-section">
          <h4>Who it's for</h4>
          <p>Students</p>
          <p>Small Business Owners</p>
          <p>Online Shoppers</p>
        </div>

        {/* SOCIAL */}
        <div className="footer-section">
          <h4>Support</h4>
          <a href="https://facebook.com">Facebook</a>
          <a href="https://instagram.com">Instagram</a>
          <a href="https://twitter.com">Twitter</a>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 QuickCommerce. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;