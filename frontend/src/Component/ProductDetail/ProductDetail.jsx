import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../api';
import { useToast } from '../Toast/Toast';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id }        = useParams();
    const navigate      = useNavigate();
    const { show }      = useToast();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qty, setQty]         = useState(1);

    const user  = JSON.parse(localStorage.getItem('user') || 'null');
    const token = localStorage.getItem('token');

    useEffect(() => {
        axios.get(`${BASE_URL}/product/${id}`)
            .then(res => setProduct(res.data?.data || res.data))
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleAddToCart = async () => {
        try {
            await axios.post(`${BASE_URL}/cart/add`,
                { productId: id, quantity: qty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.dispatchEvent(new Event('cartUpdated'));
            show(`${qty} item(s) added to cart!`, 'success');
        } catch (err) {
            show(err?.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    if (loading) return <div className="pd-loading">Loading…</div>;
    if (!product) return null;

    return (
        <div className="pd-page">
            <Link to="/" className="pd-back">← Back to products</Link>

            <div className="pd-grid">
                {/* ── Image ── */}
                <div className="pd-image-col">
                    <img
                        src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
                        alt={product.name}
                        className="pd-image"
                    />
                </div>

                {/* ── Info ── */}
                <div className="pd-info-col">
                    <p className="pd-category">{product.category}</p>
                    <h1 className="pd-name">{product.name}</h1>
                    <p className="pd-company">{product.company}</p>
                    <p className="pd-price">Rs. {Number(product.price).toLocaleString()}</p>

                    {product.description && (
                        <p className="pd-description">{product.description}</p>
                    )}

                    {/* Stock */}
                    {product.stock !== undefined && (
                        <span className={`pd-stock ${product.stock > 0 ? 'in' : 'out'}`}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                    )}

                    {user?.role === 'user' && (
                        <div className="pd-actions">
                            {/* Quantity */}
                            <div className="pd-qty">
                                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}>+</button>
                            </div>

                            <button
                                className="pd-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                🛒 Add to Cart
                            </button>
                        </div>
                    )}

                    {user?.role === 'admin' && (
                        <div className="pd-actions">
                            <Link to={`/update/${id}`} className="pd-admin-btn update">✏️ Edit Product</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;