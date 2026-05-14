import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import BASE_URL from "../../api";
import "./OrderHistory.css";

const STATUS_COLOR = {
  paid: { bg: "#dcfce7", color: "#166534", label: "Approved" },
  pending: { bg: "#fef9c3", color: "#854d0e", label: "Pending" },
  failed: { bg: "#fee2e2", color: "#991b1b", label: "Rejected" },
  submitted: { bg: "#e0f2fe", color: "#075985", label: "Submitted" },
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= TOKEN =================
  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token || localStorage.getItem("token");
    } catch {
      return localStorage.getItem("token");
    }
  };

  const token = getToken();

  // ================= FETCH ORDERS =================
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${BASE_URL}/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data?.data || []);
    } catch (err) {
      console.log("Order history error:", err?.response?.data || err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ================= LOADING =================
  if (loading) {
    return <div className="oh-loading">Loading your orders…</div>;
  }

  return (
    <div className="oh-page">
      <h1 className="oh-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="oh-empty">
          <div className="oh-empty-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here after checkout.</p>
          <a href="/" className="oh-browse-btn">
            Browse Products
          </a>
        </div>
      ) : (
        <div className="oh-list">
          {orders.map((order) => {
            const status =
              STATUS_COLOR[order.paymentStatus] || STATUS_COLOR.pending;

            return (
              <div className="oh-card" key={order._id}>

                {/* HEADER */}
                <div className="oh-card-header">
                  <div>
                    <p className="oh-order-id">
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </p>

                    <p className="oh-date">
                      {new Date(order.createdAt).toLocaleDateString(
                        "en-PK",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  <span
                    className="oh-badge"
                    style={{
                      background: status.bg,
                      color: status.color,
                    }}
                  >
                    {status.label}
                  </span>
                </div>

                {/* ITEMS */}
                <div className="oh-items">
                  {order.items?.map((item, i) => (
                    <div className="oh-item" key={i}>
                      <div className="oh-item-info">
                        <p className="oh-item-name">
                          {item.productId?.name || "Product"}
                        </p>

                        <p className="oh-item-meta">
                          Qty: {item.quantity} · Rs.{" "}
                          {Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAYMENT SCREENSHOT */}
                {order.paymentScreenshot && (
                  <div className="oh-screenshot">
                    <p className="oh-screenshot-label">
                      Payment Proof
                    </p>
                    <img
                      src={order.paymentScreenshot}
                      alt="payment proof"
                      className="oh-screenshot-img"
                    />
                  </div>
                )}

                {/* 💥 NOTIFICATIONS (NEW FEATURE) */}
                {order.notifications?.length > 0 && (
                  <div className="oh-notifications">
                    <h4 style={{ marginLeft: "20px", marginTop: "10px" }}>
                      Notifications
                    </h4>

                    {order.notifications.map((note, index) => (
                      <div
                        key={index}
                        style={{
                          marginLeft: "20px",
                          fontSize: "13px",
                          color: "#444",
                          padding: "4px 0",
                        }}
                      >
                        • {note.message}
                      </div>
                    ))}
                  </div>
                )}

                {/* FOOTER */}
                <div className="oh-card-footer">
                  <span className="oh-method">
                    {order.paymentMethod}
                  </span>

                  <span className="oh-total">
                    Rs. {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;