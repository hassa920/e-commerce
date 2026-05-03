import React from 'react'
import './Footer.css'
import { Link } from 'react-router-dom'
const Foooter = () => {
  return (
    <div className="footer">
      <div className="footer-content">

        <div className="footer-section">
          <h3>E-comm</h3>
          <p>Your trusted online store</p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <Link to="/">Products</Link>
          <Link  to="/add">Add Product</Link>
          <Link  to="/profile">Profile</Link>
        </div>

         <div className="footer-section">
          <h3>Support</h3>
          <a href="https://facebook.com">Facebook</a>
<a href="https://instagram.com">Instagram</a>
<a href="https://twitter.com">Twitter</a>
        </div>  

      </div>

      <div className="footer-bottom">
        © 2026 E-comm Dashboard. All rights reserved.
      </div>
    </div>
  )
}

export default Foooter
