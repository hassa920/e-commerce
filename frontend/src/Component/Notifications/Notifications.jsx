import React, { useEffect, useState } from "react";
import axios from "axios";
import BASE_URL from "../../api";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/my-notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data?.data || []);
        } catch (err) {
            console.log("Fetch notifications error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 3000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <h2 style={{ padding: "20px" }}>Loading...</h2>;

    return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>🔔 My Notifications</h2>

            {notifications.length === 0 ? (
                <p style={{ color: "#888", marginTop: "20px" }}>
                    No notifications yet. We'll let you know when your order status changes!
                </p>
            ) : (
                notifications.map((n, index) => (
                    <div
                        key={index}
                        style={{
                            border: `1px solid ${n.type === "success" ? "#4caf50" : "#f44336"}`,
                            borderLeft: `5px solid ${n.type === "success" ? "#4caf50" : "#f44336"}`,
                            borderRadius: "8px",
                            padding: "14px 16px",
                            marginBottom: "12px",
                            background: n.type === "success" ? "#f0fff4" : "#fff5f5",
                        }}
                    >
                        <p style={{ margin: 0, fontWeight: "600", fontSize: "15px" }}>
                            {n.message}
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#888" }}>
                            {new Date(n.createdAt).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
};

export default Notifications;