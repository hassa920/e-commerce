import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../api';
import { useToast } from '../Toast/Toast';
import './ProductDetail.css';

const ProductDetail = () => {
    const { id }      = useParams();
    const navigate    = useNavigate();
    const { show }    = useToast();

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
            await axios.post(
                `${BASE_URL}/cart/add`,
                { productId: id, quantity: qty },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            window.dispatchEvent(new Event('cartUpdated'));
            show(`${qty} item(s) added to cart!`, 'success');
        } catch (err) {
            show(err?.response?.data?.message || 'Failed to add to cart', 'error');
        }
    };

    if (loading) {
        return (
            <div className="pd-loading-wrapper">
                <div className="pd-loading-ring">
                    <div></div><div></div><div></div><div></div>
                </div>
                <p className="pd-loading-text">Loading product…</p>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className="pd-page">

            {/* ── BACK LINK ── */}
            <Link to="/" className="pd-back">
                <span className="pd-back-arrow">←</span> Back to Products
            </Link>

            {/* ── MAIN GRID ── */}
            <div className="pd-grid">

                {/* ── IMAGE COLUMN ── */}
                <div className="pd-image-col">
                    <div className="pd-image-wrap">
                        <img
                            src={product.image || 'https://via.placeholder.com/500x400?text=No+Image'}
                            alt={product.name}
                            className="pd-image"
                        />
                        {/* Stock badge over image */}
                        <span className={`pd-img-badge ${product.stock > 0 ? 'badge-in' : 'badge-out'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    {/* Thumbnail strip placeholder for future images */}
                    <div className="pd-img-meta">
                        <span className="pd-img-meta-text">Product Image</span>
                    </div>
                </div>

                {/* ── INFO COLUMN ── */}
                <div className="pd-info-col">

                    {/* Category + Company chips */}
                    <div className="pd-chips">
                        <span className="pd-chip-cat">{product.category}</span>
                        <span className="pd-chip-brand">{product.company}</span>
                    </div>

                    {/* Product Name */}
                    <div className="pd-field-block">
                        <label className="pd-field-label">Product Name</label>
                        <h1 className="pd-name">{product.name}</h1>
                    </div>

                    {/* Price */}
                    <div className="pd-field-block">
                        <label className="pd-field-label">Price</label>
                        <p>Rs. {Number(product.price).toLocaleString()}</p>
                    </div>

                    {/* Description */}
                    {product.description && (
                        <div className="pd-field-block">
                            <label className="pd-field-label">Description</label>
                            <p className="pd-description">{product.description}</p>
                        </div>
                    )}

                    {/* Brand */}
                    <div className="pd-field-block">
                        <label className="pd-field-label">Brand</label>
                        <p className="pd-meta-val">{product.company}</p>
                    </div>

                    {/* Category */}
                    <div className="pd-field-block">
                        <label className="pd-field-label">Category</label>
                        <p className="pd-meta-val">{product.category}</p>
                    </div>

                    {/* Stock */}
                    {product.stock !== undefined && (
                        <div className="pd-field-block">
                            <label className="pd-field-label">Availability</label>
                            <span className={`pd-stock-badge ${product.stock > 0 ? 'stock-in' : 'stock-out'}`}>
                                <span className="stock-dot"></span>
                                {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
                            </span>
                        </div>
                    )}

                    <div className="pd-divider" />

                    {/* ── USER ACTIONS ── */}
                    {user?.role === 'user' && (
                        <div className="pd-actions">
                            <div className="pd-qty-block">
                                <label className="pd-field-label">Quantity</label>
                                <div className="pd-qty">
                                    <button
                                        className="pd-qty-btn"
                                        onClick={() => setQty(q => Math.max(1, q - 1))}
                                    >−</button>
                                    <span className="pd-qty-val">{qty}</span>
                                    <button
                                        className="pd-qty-btn"
                                        onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}
                                    >+</button>
                                </div>
                            </div>

                            <button
                                className="pd-cart-btn"
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                            >
                                <span className="pd-btn-icon">🛒</span>
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        </div>
                    )}

                    {/* ── ADMIN ACTIONS ── */}
                    {user?.role === 'admin' && (
                        <div className="pd-actions">
                            <Link to={`/update/${id}`} className="pd-admin-update">
                                <span className="pd-btn-icon">✏️</span> Edit Product
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default ProductDetail;