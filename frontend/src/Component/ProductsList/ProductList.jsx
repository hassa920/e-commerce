import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './ProductList.css';
import { Link } from 'react-router-dom';
import BASE_URL from '../../api';

const ProductList = () => {
    const [products, setProductList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const user = JSON.parse(localStorage.getItem("user"));

    const handleAddToCart = async (productId) => {
        try {
            const token = localStorage.getItem("token");

            await axios.post(`${BASE_URL}/cart/add`,
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // ✅ REAL-TIME CART UPDATE (CORRECT PLACE)
            window.dispatchEvent(new Event("cartUpdated"));

            alert("Added to cart!");

        } catch (err) {
            alert(err?.response?.data?.message || "Failed to add to cart");
        }
    };

    const getProducts = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/products`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = res.data?.data;
            setProductList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.log("Error fetching products:", err.response);
            setProductList([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete?");
        if (!confirmDelete) return;

        try {
            await axios.delete(`${BASE_URL}/product/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            getProducts();

        } catch (err) {
            console.log("Delete error:", err.response);
        }
    };

    const searchProductsHandler = (e) => {
        const query = e.target.value;
        setSearch(query);
    };

    const fetchProducts = async () => {
        const words = search.split(" ");

        let q = "";
        let price = "";

        words.forEach((w) => {
            if (!isNaN(w)) {
                price = w;
            } else {
                q += w + " ";
            }
        });

        try {
            const res = await axios.get(`${BASE_URL}/search`, {
                params: {
                    q: q.trim() || undefined,
                    price: price || undefined,
                },
            });

            setProductList(res.data);

        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getProducts();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts();
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    if (loading) {
        return <h2 style={{ textAlign: "center" }}>Loading...</h2>;
    }

    return (
        <div className="product-page">

            <h1 className="page-title">Products List</h1>

            <div className="searchWrapper">
                <input
                    type="text"
                    placeholder="Search products by name, category and company..."
                    value={search}
                    onChange={searchProductsHandler}
                    className='searchInput'
                />
            </div>

            <div className="product-grid">

                {(products || []).length === 0 ? (
                    <h3 style={{ textAlign: "center" }}>No products found</h3>
                ) : (
                    products.map((product) => (
                        <div className="product-card" key={product._id}>

                            <div className="card-image-wrapper">
                                <img
                                    src={product.image || "https://via.placeholder.com/150"}
                                    alt={product.name}
                                    className="card-image"
                                />
                            </div>

                            <div className="card-body">

                                <div className="field-group-list">
                                    <label className="field-label-list">Product Name</label>
                                    <p className="field-value product-name">{product.name}</p>
                                </div>

                                <div className="field-group-list">
                                    <label className="field-label-list">Company</label>
                                    <p className="field-value">{product.company}</p>
                                </div>

                                <div className="field-group-list">
                                    <label className="field-label-list">Category</label>
                                    <p className="field-value">{product.category}</p>
                                </div>

                                <div className="field-group-list">
                                    <label className="field-label-list">Price</label>
                                    <p className="field-value product-price">
                                        Rs. {product.price}
                                    </p>
                                </div>

                            </div>

                            <div className="card-actions">

                                {/* 🛒 USER ONLY */}
                                {user?.role === "user" && (
                                    <button
                                        className="btn btn-cart"
                                        onClick={() => handleAddToCart(product._id)}
                                    >
                                        🛒 Add to Cart
                                    </button>
                                )}

                                {/* 👑 ADMIN ONLY */}
                                {user?.role === "admin" && (
                                    <>
                                        <Link
                                            to={`/update/${product._id}`}
                                            className="btn btn-update"
                                        >
                                            ✏️ Update
                                        </Link>

                                        <button
                                            className="btn btn-delete"
                                            onClick={() => handleDelete(product._id)}
                                        >
                                            🗑️ Delete
                                        </button>
                                    </>
                                )}

                            </div>

                        </div>
                    ))
                )}

            </div>
        </div>
    );
};

export default ProductList;