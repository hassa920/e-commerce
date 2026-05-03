import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BASE_URL from '../../api';
import './Cart.css';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // ✅ NEW STATE (FIXED)
    const [selectedMethod, setSelectedMethod] = useState("COD");

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCart = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/cart`, { headers });
            setCartItems(res.data?.data || []);
        } catch (err) {
            console.log("Cart fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await axios.delete(`${BASE_URL}/cart/remove/${productId}`, { headers });

            // 🔥 REAL-TIME UPDATE
            window.dispatchEvent(new Event("cartUpdated"));

            fetchCart();

        } catch (err) {
            console.log("Remove error:", err);
        }
    };

    // 💳 CHECKOUT (UPDATED)
    const handleCheckout = async () => {
        try {
            const res = await axios.post(
                `${BASE_URL}/order/checkout`,
                { paymentMethod: selectedMethod }, // ✅ FIXED
                { headers }
            );

            const order = res.data?.data;

            if (selectedMethod === "COD") {
                alert("Order placed successfully!");
            } else {
                // 🔥 REDIRECT TO PAYMENT PAGE
                window.location.href = `/payment/${order._id}`;
            }

            fetchCart();
        } catch (err) {
            alert(err?.response?.data?.message || "Checkout failed");
        }
    };

    const getTotal = () => {
        return cartItems.reduce((sum, item) => {
            const price = Number(item.productId?.price) || 0;
            return sum + price * item.quantity;
        }, 0);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    if (loading) return <h2 className="cart-loading">Loading cart...</h2>;

    return (
        <div className="cart-page">

            <div className="cart-header">
                <div className="cart-title-row">
                    <h1>My Cart</h1>

                    {cartItems.length > 0 && (
                        <span className="cart-badge">
                            {cartItems.length} items
                        </span>
                    )}
                </div>

                <Link to="/" className="continue-link">
                    Continue shopping →
                </Link>
            </div>

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
                    <div className="cart-list">

                        {cartItems.map((item) => (
                            <div
                                className="cart-item"
                                key={item._id || item.productId?._id}
                            >

                                <div className="cart-item-img">
                                    <img
                                        src={item.productId?.image || "https://via.placeholder.com/72"}
                                        alt={item.productId?.name}
                                    />
                                </div>

                                <div className="cart-item-info">
                                    <p className="cart-item-name">
                                        {item.productId?.name}
                                    </p>

                                    <p className="cart-item-meta">
                                        {item.productId?.company} · {item.productId?.category}
                                    </p>

                                    <p className="cart-item-price">
                                        Rs. {Number(item.productId?.price).toLocaleString()}
                                    </p>
                                </div>

                                <div className="cart-item-qty">
                                    <span className="qty-label">
                                        Qty: {item.quantity}
                                    </span>
                                </div>

                                <button
                                    className="cart-remove-btn"
                                    onClick={() => handleRemove(item.productId?._id)}
                                >
                                    ✕
                                </button>

                            </div>
                        ))}

                    </div>

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

                        {/* 💳 PAYMENT METHOD SELECT */}
                        {/* 💳 PAYMENT METHOD SELECT */}
<div className="payment-method-wrapper">
    <p className="payment-method-label">Payment Method</p>

    <div className="payment-options">
        {[
            { value: "COD", icon: "💵", title: "Cash on Delivery", sub: "Pay when you receive" },
            { value: "JAZZCASH", icon: "📱", title: "JazzCash", sub: "Mobile wallet payment" },
            { value: "EASYPAISA", icon: "💳", title: "Easypaisa", sub: "Mobile wallet payment" }
        ].map((method) => (
            <div
                key={method.value}
                className={`payment-option ${selectedMethod === method.value ? "active" : ""}`}
                onClick={() => setSelectedMethod(method.value)}
            >
                <span className="payment-option-icon">{method.icon}</span>
                <div className="payment-option-text">
                    <span className="payment-option-title">{method.title}</span>
                    <span className="payment-option-sub">{method.sub}</span>
                </div>
                <div className="payment-option-radio">
                    {selectedMethod === method.value && <div className="radio-dot" />}
                </div>
            </div>
        ))}
    </div>
</div>

                        {/* 💳 CHECKOUT BUTTON */}
                        <button className="checkout-btn" onClick={handleCheckout}>
                            Proceed to Checkout
                        </button>

                    </div>
                </>
            )}

        </div>
    );
};

export default Cart;