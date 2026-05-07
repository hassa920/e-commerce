import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../api';
import './Nav.css';

const Nav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem('user'));
  } catch {
    storedUser = null;
  }

  const user = storedUser?.user;
  const token = storedUser?.token;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const fetchCartCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data?.data || [];
      setCartCount(items.reduce((s, i) => s + (i.quantity || 0), 0));
    } catch {
      setCartCount(0);
    }
  }, [token]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  const logOut = () => {
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const close = () => setMenuOpen(false);

  return (
    <header className={`nav-wrapper ${scrolled ? 'scrolled' : ''}`}>

      {/* BRAND */}
      <div className="nav-brand">
        <span className="nav-logo">⚡ QuickCommerce</span>
        <span className="nav-subtitle">Fast • Secure • Reliable Shopping</span>
      </div>

      {/* HAMBURGER */}
      <button
        className={`nav-hamburger ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(v => !v)}
      >
        <span></span><span></span><span></span>
      </button>

      {/* MENU */}
      {user ? (
        <nav className={`nav-menu ${menuOpen ? 'nav-open' : ''}`}>

          <Link to="/" onClick={close} className="nav-link">
            🛍 Products
          </Link>

          {user.role === 'user' && (
            <>
              <Link to="/cart" onClick={close} className="nav-link">
                🛒 Cart <span className="nav-badge">{cartCount}</span>
              </Link>

              <Link to="/orders" onClick={close} className="nav-link">
                📦 Orders
              </Link>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Link to="/add" onClick={close} className="nav-link">
                ➕ Add Product
              </Link>

              <Link to="/admin/orders" onClick={close} className="nav-link">
                📋 Orders
              </Link>

              <Link to="/admin/dashboard" onClick={close} className="nav-link">
                📊 Dashboard
              </Link>
            </>
          )}

          <Link to="/profile" onClick={close} className="nav-link">
            👤 {user?.name}
          </Link>

          <button className="nav-logout-btn" onClick={logOut}>
            Logout
          </button>
        </nav>
      ) : (
        <nav className={`nav-menu ${menuOpen ? 'nav-open' : ''}`}>

          <Link to="/signup" onClick={close} className="nav-link">
            Create Account
          </Link>

          <Link to="/login" onClick={close} className="nav-link primary">
            Sign In
          </Link>

        </nav>
      )}
    </header>
  );
};

export default Nav