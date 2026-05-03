import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);

    const token = localStorage.getItem("token");

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/admin/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(res.data?.data || []);
        } catch (err) {
            console.log("Fetch orders error:", err);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const approvePayment = async (order) => {
        try {
            await axios.put(
                `${BASE_URL}/admin/order/payment/${order._id}`,
                { action: "approve" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Payment Approved");
            fetchOrders();

        } catch (err) {
            console.log("Approve error:", err);
            alert(err?.response?.data?.message || "Error approving payment");
        }
    };

    const rejectPayment = async (order) => {
        try {
            await axios.put(
                `${BASE_URL}/admin/order/payment/${order._id}`,
                { action: "reject" },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Payment Rejected");
            fetchOrders();

        } catch (err) {
            console.log("Reject error:", err);
            alert(err?.response?.data?.message || "Error rejecting payment");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Admin Orders</h2>

            {orders.map((order) => (
                <div
                    key={order._id}
                    style={{
                        border: "1px solid #ccc",
                        marginBottom: "10px",
                        padding: "10px",
                        borderRadius: "8px"
                    }}
                >
                    <p><b>User:</b> {order.userId?.name}</p>
                    <p><b>Total:</b> {order.totalAmount}</p>
                    <p><b>Payment Status:</b> {order.paymentStatus}</p>

                    {order.paymentStatus !== "paid" && (
                        <>
                            <button
                                onClick={() => approvePayment(order)}
                                style={{
                                    marginRight: "10px",
                                    background: "green",
                                    color: "#fff",
                                    padding: "5px 10px"
                                }}
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => rejectPayment(order)}
                                style={{
                                    background: "red",
                                    color: "#fff",
                                    padding: "5px 10px"
                                }}
                            >
                                Reject
                            </button>
                        </>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdminOrders;