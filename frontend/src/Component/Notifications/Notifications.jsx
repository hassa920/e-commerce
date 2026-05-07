import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BASE_URL from '../../api';
import './Notification.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading]             = useState(true);

    const token = localStorage.getItem('token');

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await axios.get(`${BASE_URL}/my-notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data?.data || []);
        } catch (err) {
            console.log('Fetch notifications error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);  // FIXED: was 3s
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    if (loading) return <div className="notif-loading">Loading…</div>;

    return (
        <div className="notif-page">
            <h1 className="notif-title">Notifications</h1>

            {notifications.length === 0 ? (
                <div className="notif-empty">
                    <div className="notif-empty-icon">🔔</div>
                    <p>No notifications yet.</p>
                    <span>We'll let you know when your order status changes.</span>
                </div>
            ) : (
                <div className="notif-list">
                    {notifications.map((n, i) => (
                        <div key={i} className={`notif-item notif-${n.type}`}>
                            <div className="notif-dot" />
                            <div className="notif-body">
                                <p className="notif-msg">{n.message}</p>
                                <p className="notif-time">{new Date(n.createdAt).toLocaleString('en-PK')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;