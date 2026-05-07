import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../api";
import "./Nav.css";

const Nav = () => {
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // GET USER FROM LOCAL STORAGE
  let storedUser = null;

  try {
    storedUser = JSON.parse(localStorage.getItem("user"));
  } catch {
    storedUser = null;
  }

  const user = storedUser?.user;
  const token = storedUser?.token;

  // SCROLL EFFECT
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // FETCH CART COUNT
  const fetchCartCount = useCallback(async () => {
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const items = res.data?.data || [];

      const total = items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );

      setCartCount(total);
    } catch (error) {
      setCartCount(0);
    }
  }, [token]);

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  // LOGOUT
  const logOut = () => {
    localStorage.removeItem("user");

    delete axios.defaults.headers.common["Authorization"];

    navigate("/login");
  };

  // CLOSE MOBILE MENU
  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <header className={`nav-wrapper ${scrolled ? "scrolled" : ""}`}>
      
      {/* BRAND */}
      <div className="nav-brand">
        <span className="nav-logo">⚡ QuickCommerce</span>

        <span className="nav-subtitle">
          Fast • Secure • Reliable Shopping
        </span>
      </div>

      {/* HAMBURGER */}
      <button
        className={`nav-hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* MENU */}
      <nav className={`nav-menu ${menuOpen ? "nav-open" : ""}`}>

        {/* USER MENU */}
        {user ? (
          <>
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              🛍 Products
            </NavLink>

            {/* USER ROUTES */}
            {user.role === "user" && (
              <>
                <NavLink
                  to="/cart"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  🛒 Cart
                  {cartCount > 0 && (
                    <span className="nav-badge">{cartCount}</span>
                  )}
                </NavLink>

                <NavLink
                  to="/orders"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  📦 Orders
                </NavLink>
              </>
            )}

            {/* ADMIN ROUTES */}
            {user.role === "admin" && (
              <>
                <NavLink
                  to="/add"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  ➕ Add Product
                </NavLink>

                <NavLink
                  to="/admin/orders"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  📋 Orders
                </NavLink>

                <NavLink
                  to="/admin/dashboard"
                  onClick={closeMenu}
                  className={({ isActive }) =>
                    isActive ? "nav-link active" : "nav-link"
                  }
                >
                  📊 Dashboard
                </NavLink>
              </>
            )}

            {/* PROFILE */}
            <NavLink
              to="/profile"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              👤 {user?.name}
            </NavLink>

            {/* LOGOUT */}
            <button
              className="nav-logout-btn"
              onClick={() => {
                closeMenu();
                logOut();
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            {/* GUEST ROUTES */}
            <NavLink
              to="/signup"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Create Account
            </NavLink>

            <NavLink
              to="/login"
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Sign In
            </NavLink>
          </>
        )}
      </nav>
    </header>
  );
};

export default Nav;