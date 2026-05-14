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

  // ================= GET ALL ORDERS =================
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
      alert("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE PAYMENT STATUS =================
  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/order/payment-status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paymentStatus }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`Payment ${paymentStatus}`);
        getOrders();
      } else {
        alert(data.message || "Failed to update payment");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating payment");
    }
  };

  // ================= UPDATE ORDER STATUS (OPTIONAL KEEP) =================
  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(
        `${BASE_URL}/admin/order/status/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(`Order status updated to ${status}`);
        getOrders();
      } else {
        alert(data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
    }
  };

  // ================= DELETE ORDER =================
  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(`${BASE_URL}/admin/order/${orderId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        alert("Order deleted successfully");
        getOrders();
      } else {
        alert(data.message || "Failed to delete order");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting order");
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  if (loading) {
    return <div className="ao-loading">Loading orders...</div>;
  }

  return (
    <div className="ao-page">
      <h2 className="ao-title">Admin Orders</h2>

      {orders.length === 0 ? (
        <div className="ao-empty">No orders found</div>
      ) : (
        <div className="ao-list">
          {orders.map((order) => (
            <div key={order._id} className="ao-card">

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

                {/* FIXED LABEL */}
                <span
                  className={`ao-badge ao-badge-${order.paymentStatus}`}
                >
                  {order.paymentStatus === "submitted"
                    ? "Payment Submitted"
                    : order.paymentStatus}
                </span>
              </div>

              {/* ITEMS */}
              <div className="ao-products">
                {order.items?.map((item, index) => (
                  <div key={index} className="ao-product">
                    <img
                      src={item.productId?.image}
                      alt={item.productId?.name}
                      className="ao-product-img"
                    />

                    <div className="ao-product-info">
                      <h4>{item.productId?.name}</h4>
                      <p>
                        Qty: {item.quantity} × Rs. {item.price}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* INFO */}
              <div className="ao-card-info">
                <div className="ao-info-row">
                  <span>Total</span>
                  <strong>Rs. {order.totalAmount}</strong>
                </div>

                <div className="ao-info-row">
                  <span>Payment Method</span>
                  <strong>{order.paymentMethod}</strong>
                </div>

                {/* OPTIONAL ORDER STATUS */}
                <div className="ao-info-row">
                  <span>Order Status</span>

                  <select
                    value={order.status}
                    onChange={(e) =>
                      updateOrderStatus(order._id, e.target.value)
                    }
                    className="ao-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* SCREENSHOT (IMPORTANT) */}
              {order.paymentScreenshot && (
                <div className="ao-screenshot">
                  <p className="ao-screenshot-label">
                    Payment submitted by client
                  </p>

                  <img
                    src={order.paymentScreenshot}
                    className="ao-screenshot-img"
                    alt="payment"
                  />
                </div>
              )}

              {/* ACTIONS (ONLY APPROVE / REJECT) */}
              {order.paymentStatus === "submitted" && (
                <div className="ao-actions">

                  <button
                    className="ao-approve-btn"
                    onClick={() =>
                      updatePaymentStatus(order._id, "paid")
                    }
                  >
                    Approve
                  </button>

                  <button
                    className="ao-reject-btn"
                    onClick={() =>
                      updatePaymentStatus(order._id, "failed")
                    }
                  >
                    Reject
                  </button>

                </div>
              )}

              {/* DELETE */}
              <button
                className="ao-delete-btn"
                onClick={() => deleteOrder(order._id)}
              >
                Delete Order
              </button>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrder;