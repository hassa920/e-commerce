import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import BASE_URL from "../../api";
import "./Cart.css";
import { useToast } from "../Toast/Toast";

const Cart = () => {
  const { show } = useToast();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("COD");

  // ================= SAFE TOKEN =================
  let token = null;
  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    token = stored?.token;
  } catch {
    token = null;
  }

  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ================= FETCH CART =================
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/cart`, { headers });
      setCartItems(res.data?.data || []);
    } catch (err) {
      console.log("Cart fetch error:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ================= REMOVE ITEM =================
  const handleRemove = async (productId) => {
    try {
      await axios.delete(`${BASE_URL}/cart/remove/${productId}`, { headers });
      show("Item removed", "success");
      window.dispatchEvent(new Event("cartUpdated"));
      fetchCart();
    } catch (err) {
      show("Failed to remove item", "error");
    }
  };

  // ================= UPDATE QUANTITY =================
  const handleQtyChange = async (productId, newQty) => {
    if (newQty < 1) return;
    try {
      await axios.put(
        `${BASE_URL}/cart/update/${productId}`,
        { quantity: newQty },
        { headers }
      );
      window.dispatchEvent(new Event("cartUpdated"));
      fetchCart();
    } catch (err) {
      show("Failed to update quantity", "error");
    }
  };

  // ================= CLEAR CART =================
  const handleClearCart = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await axios.delete(`${BASE_URL}/cart/clear`, { headers });
      show("Cart cleared", "success");
      window.dispatchEvent(new Event("cartUpdated"));
      fetchCart();
    } catch (err) {
      show("Failed to clear cart", "error");
    }
  };

  // ================= CHECKOUT =================
  const handleCheckout = async () => {
    if (!token) {
      show("Please login to place an order", "error");
      navigate("/login");
      return;
    }

    if (cartItems.length === 0) {
      show("Your cart is empty", "error");
      return;
    }

    try {
      setPlacingOrder(true);

      const res = await axios.post(
        `${BASE_URL}/order/checkout`,
        { paymentMethod: selectedMethod },
        { headers }
      );

      const order = res.data?.data;

      if (!order?._id) {
        show("Order could not be created", "error");
        return;
      }

      // cart is cleared on backend, sync UI everywhere
      window.dispatchEvent(new Event("cartUpdated"));

      if (selectedMethod === "COD") {
        show("Order placed successfully!", "success");
        await fetchCart();
        // send user to their orders page
        navigate(`/my-orders`);
      } else {
        // JazzCash / Easypaisa → upload payment screenshot screen
        show("Order created. Please complete the payment.", "success");
        navigate(`/payment/${order._id}`);
      }
    } catch (err) {
      console.log("Checkout error:", err);
      show(err?.response?.data?.message || "Checkout failed", "error");
    } finally {
      setPlacingOrder(false);
    }
  };

  // ================= CANCEL ORDER (utility, optional reuse) =================
  // Kept here in case you want to expose a "cancel last order" action later.
  // eslint-disable-next-line no-unused-vars
  const handleCancelOrder = async (orderId) => {
    try {
      await axios.put(
        `${BASE_URL}/order/cancel/${orderId}`,
        {},
        { headers }
      );
      show("Order cancelled", "success");
    } catch (err) {
      show(err?.response?.data?.message || "Failed to cancel order", "error");
    }
  };

  // ================= TOTAL =================
  const getTotal = () =>
    cartItems.reduce(
      (sum, item) =>
        sum + (Number(item.productId?.price) || 0) * item.quantity,
      0
    );

  // ================= INIT =================
  useEffect(() => {
    fetchCart();
    const sync = () => fetchCart();
    window.addEventListener("cartUpdated", sync);
    return () => window.removeEventListener("cartUpdated", sync);
  }, [fetchCart]);

  // ================= UI =================
  if (loading) {
    return <h2 className="cart-loading">Loading cart…</h2>;
  }

  return (
    <div className="cart-page">
      {/* HEADER */}
      <div className="cart-header">
        <div className="cart-title-row">
          <h1>My Cart</h1>
          {cartItems.length > 0 && (
            <span className="cart-badge">{cartItems.length} items</span>
          )}
        </div>

        <div className="cart-header-actions">
          <Link to="/" className="continue-link">
            Continue shopping →
          </Link>

          {cartItems.length > 0 && (
            <button className="clear-cart-btn" onClick={handleClearCart}>
              Clear Cart
            </button>
          )}
        </div>
      </div>

      {/* EMPTY */}
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Browse products and add something you like!</p>
          <Link to="/" className="browse-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* ITEMS */}
          <div className="cart-list">
            {cartItems.map((item) => (
              <div className="cart-item" key={item._id}>
                {/* IMAGE */}
                <div className="cart-item-img">
                  <img
                    src={
                      item.productId?.image ||
                      "https://via.placeholder.com/72"
                    }
                    alt={item.productId?.name}
                  />
                </div>

                {/* INFO */}
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.productId?.name}</p>
                  <p className="cart-item-meta">
                    {item.productId?.company} · {item.productId?.category}
                  </p>
                  <p className="cart-item-price">
                    Rs.{" "}
                    {Number(item.productId?.price).toLocaleString()}
                  </p>
                </div>

                {/* QTY */}
                <div className="cart-qty-control">
                  <button
                    onClick={() =>
                      handleQtyChange(
                        item.productId?._id,
                        item.quantity - 1
                      )
                    }
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      handleQtyChange(
                        item.productId?._id,
                        item.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                {/* SUBTOTAL */}
                <p className="cart-item-subtotal">
                  Rs.{" "}
                  {(
                    Number(item.productId?.price) * item.quantity
                  ).toLocaleString()}
                </p>

                {/* REMOVE */}
                <button
                  className="cart-remove-btn"
                  onClick={() => handleRemove(item.productId?._id)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="cart-summary">
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>Rs. {getTotal().toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span className="free-shipping">Free</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <span>Rs. {getTotal().toLocaleString()}</span>
            </div>

            {/* PAYMENT */}
            <div className="payment-method-wrapper">
              <p className="payment-method-label">Payment Method</p>

              <div className="payment-options">
                {[
                  {
                    value: "COD",
                    icon: "💵",
                    title: "Cash on Delivery",
                    sub: "Pay when you receive",
                  },
                  {
                    value: "JAZZCASH",
                    icon: "📱",
                    title: "JazzCash",
                    sub: "Mobile wallet",
                  },
                  {
                    value: "EASYPAISA",
                    icon: "💳",
                    title: "Easypaisa",
                    sub: "Mobile wallet",
                  },
                ].map((m) => (
                  <div
                    key={m.value}
                    className={`payment-option ${
                      selectedMethod === m.value ? "active" : ""
                    }`}
                    onClick={() => setSelectedMethod(m.value)}
                  >
                    <span className="payment-option-icon">{m.icon}</span>

                    <div className="payment-option-text">
                      <span className="payment-option-title">{m.title}</span>
                      <span className="payment-option-sub">{m.sub}</span>
                    </div>

                    <div className="payment-option-radio">
                      {selectedMethod === m.value && (
                        <div className="radio-dot" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CHECKOUT */}
            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={placingOrder}
            >
              {placingOrder
                ? "Placing order…"
                : selectedMethod === "COD"
                ? "Place Order"
                : "Proceed to Payment"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
