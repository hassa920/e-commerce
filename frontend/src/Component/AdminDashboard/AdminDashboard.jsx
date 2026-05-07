import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import BASE_URL from '../../api';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        totalProducts: 0,
    });

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = storedUser?.token;

    const headers = { Authorization: `Bearer ${token}` };

    const fetchData = useCallback(async () => {
        try {
            const [ordersRes, productsRes] = await Promise.all([
                axios.get(`${BASE_URL}/admin/orders`, { headers }),
                axios.get(`${BASE_URL}/products`, { headers }),
            ]);

            const allOrders = ordersRes.data?.data || [];
            const allProducts = productsRes.data?.data || [];

            const totalRevenue = allOrders
                .filter(o => o.paymentStatus === 'paid')
                .reduce((s, o) => s + Number(o.totalAmount || 0), 0);

            const pending = allOrders.filter(o => o.paymentStatus === 'pending').length;
            const approved = allOrders.filter(o => o.paymentStatus === 'paid').length;
            const rejected = allOrders.filter(o => o.paymentStatus === 'rejected').length;

            setStats({
                totalOrders: allOrders.length,
                totalRevenue,
                pending,
                approved,
                rejected,
                totalProducts: allProducts.length,
            });

            setOrders(allOrders.slice(0, 5));
        } catch (err) {
            console.log('Dashboard error:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <div className="dash-loading">Loading dashboard…</div>;

    return (
        <div className="dash-page">
            <h1 className="dash-title">Admin Dashboard</h1>

            {/* ── Stat cards ── */}
            <div className="dash-stats">
                <div className="stat-card">
                    <p className="stat-label">Total Revenue</p>
                    <p className="stat-value">
                        Rs. {stats.totalRevenue.toLocaleString()}
                    </p>
                </div>

                <div className="stat-card">
                    <p className="stat-label">Total Orders</p>
                    <p className="stat-value">{stats.totalOrders}</p>
                </div>

                <div className="stat-card pending">
                    <p className="stat-label">Pending</p>
                    <p className="stat-value">{stats.pending}</p>
                </div>

                <div className="stat-card approved">
                    <p className="stat-label">Approved</p>
                    <p className="stat-value">{stats.approved}</p>
                </div>

                <div className="stat-card rejected">
                    <p className="stat-label">Rejected</p>
                    <p className="stat-value">{stats.rejected}</p>
                </div>

                <div className="stat-card">
                    <p className="stat-label">Products</p>
                    <p className="stat-value">{stats.totalProducts}</p>
                </div>
            </div>

            {/* ── Recent orders ── */}
            <div className="dash-section">
                <div className="dash-section-header">
                    <h2>Recent orders</h2>
                    <a href="/admin/orders" className="dash-see-all">See all →</a>
                </div>

                <div className="dash-table-wrap">
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Status</th>
                            </tr>
                        </thead>

                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td className="order-id">
                                        #{order._id.slice(-6).toUpperCase()}
                                    </td>
                                    <td>{order.userId?.name || '—'}</td>
                                    <td>Rs. {Number(order.totalAmount || 0).toLocaleString()}</td>
                                    <td>{order.paymentMethod}</td>
                                    <td>
                                        <span className={`dash-status dash-${order.paymentStatus}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;