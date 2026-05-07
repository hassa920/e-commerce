import React, { useEffect, useState } from "react";
import BASE_URL from "../../api";
import "./AdminOrder.css";

const AdminOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= TOKEN =================
  const getToken = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.token;
    } catch {
      return null;
    }
  };

  const token = getToken();

  // ================= GET ORDERS =================
  const getOrders = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URL}/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTION =================
  const handlePaymentAction = async (orderId, action) => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/order/payment/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`Payment ${action}ed`);
        getOrders();
      }
    } catch (err) {
      alert("Error updating payment");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // ================= LOADING =================
  if (loading) {
    return <div className="ao-loading">Loading orders...</div>;
  }

  return (
    <div className="ao-page">

      <h2 className="ao-title">All Orders</h2>

      {orders.length === 0 ? (
        <div className="ao-empty">No orders found</div>
      ) : (
        <div className="ao-list">

          {orders.map((order) => {

            const statusClass =
              order.paymentStatus === "submitted"
                ? "ao-pending"
                : order.paymentStatus === "paid"
                ? "ao-paid"
                : "ao-rejected";

            return (
              <div
                key={order._id}
                className={`ao-card ${statusClass}`}
              >

                {/* TOP */}
                <div className="ao-card-top">

                  <div>
                    <p className="ao-order-id">
                      Order #{order._id.slice(-6)}
                    </p>
                    <p className="ao-customer">
                      {order.userId?.name} • {order.userId?.email}
                    </p>
                  </div>

                  <span
                    className={`ao-badge ao-badge-${order.paymentStatus}`}
                  >
                    {order.paymentStatus}
                  </span>

                </div>

                {/* INFO */}
                <div className="ao-card-info">
                  <div className="ao-info-row">
                    <span>Total</span>
                    <strong>Rs. {order.totalAmount}</strong>
                  </div>

                  <div className="ao-info-row">
                    <span>Status</span>
                    <strong>{order.status}</strong>
                  </div>
                </div>

                {/* SCREENSHOT */}
                {order.paymentScreenshot && (
                  <div className="ao-screenshot">
                    <p className="ao-screenshot-label">
                      Payment Screenshot
                    </p>
                    <img
                      src={order.paymentScreenshot}
                      className="ao-screenshot-img"
                      alt="payment"
                    />
                  </div>
                )}

                {/* ACTIONS */}
                {order.paymentStatus === "submitted" && (
                  <div className="ao-actions">

                    <button
                      className="ao-approve-btn"
                      onClick={() =>
                        handlePaymentAction(order._id, "approve")
                      }
                    >
                      Approve
                    </button>

                    <button
                      className="ao-reject-btn"
                      onClick={() =>
                        handlePaymentAction(order._id, "reject")
                      }
                    >
                      Reject
                    </button>

                  </div>
                )}

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default AdminOrder;