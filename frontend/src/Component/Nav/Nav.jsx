import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import BASE_URL from "../../api";
import "./Nav.css";

const Nav = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  const auth = localStorage.getItem("user");
  const user = auth ? JSON.parse(auth) : null;
  const token = localStorage.getItem("token");

  // ================= SCROLL =================
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ================= CART =================
  const fetchCartCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const items = res.data?.data || [];
      const totalQty = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(totalQty);
    } catch {
      setCartCount(0);
    }
  }, [token]);

  // ================= NOTIFICATIONS COUNT (from backend) =================
  const fetchNotifCount = useCallback(async () => {
    if (!token || user?.role !== "user") return;
    try {
      const res = await axios.get(`${BASE_URL}/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifications = res.data?.data || [];

      // ✅ Count only unread — compare against last seen timestamp in localStorage
      const lastSeen = localStorage.getItem(`notif_last_seen_${user._id}`) || "1970-01-01";
      const unread = notifications.filter(
        (n) => new Date(n.createdAt) > new Date(lastSeen)
      );

      setNotifCount(unread.length);
    } catch {
      setNotifCount(0);
    }
  }, [token, user?.role, user?._id]);

  // ================= AUTO REFRESH =================
  useEffect(() => {
    fetchCartCount();
    fetchNotifCount();

    window.addEventListener("cartUpdated", fetchCartCount);

    // ✅ Poll backend every 5 seconds for new notifications
    const interval = setInterval(fetchNotifCount, 5000);

    return () => {
      window.removeEventListener("cartUpdated", fetchCartCount);
      clearInterval(interval);
    };
  }, [fetchCartCount, fetchNotifCount]);

  const logOut = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ================= MARK AS READ =================
  const handleNotifClick = () => {
    // ✅ Save current timestamp so next poll shows 0 unread
    if (user?._id) {
      localStorage.setItem(`notif_last_seen_${user._id}`, new Date().toISOString());
      setNotifCount(0);
    }
  };

  return (
    <div className={`nav-wrapper ${scrolled ? "scrolled" : ""}`}>
      {user ? (
        <ul className="nav-ul">
          <li><Link to="/">Products</Link></li>

          {user?.role === "user" && (
            <li>
              <Link to="/cart">🛒 Cart ({cartCount})</Link>
            </li>
          )}

          {user?.role === "user" && (
            <li>
              <Link to="/notifications" onClick={handleNotifClick}>
                🔔 Notifications {notifCount > 0 && `(${notifCount})`}
              </Link>
            </li>
          )}

          {user?.role === "admin" && (
            <>
              <li><Link to="/add">Add Product</Link></li>
              <li><Link to="/admin/orders">Orders</Link></li>
            </>
          )}

          <li>
            <Link to="/login" onClick={logOut}>
              Logout ({user?.name})
            </Link>
          </li>
        </ul>
      ) : (
        <ul className="nav-ul nav-right">
          <li><Link to="/signup">Sign Up</Link></li>
          <li><Link to="/login">Login</Link></li>
        </ul>
      )}
    </div>
  );
};

export default Nav;