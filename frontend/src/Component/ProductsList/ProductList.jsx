import axios from "axios";
import React, { useEffect, useState } from "react";
import "./ProductList.css";
import { Link } from "react-router-dom";
import BASE_URL from "../../api";
import { useToast } from "../Toast/Toast";

const ProductList = () => {
  const { show } = useToast();

  const [products, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);

  let userData = null;

  try {
    userData = JSON.parse(localStorage.getItem("user"));
  } catch {
    userData = null;
  }

  const token = userData?.token;
  const user = userData?.user;

  const getAuthHeader = () =>
    token ? { Authorization: `Bearer ${token}` } : {};

  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/products`);
      setProductList(res.data?.data || []);
    } catch {
      setProductList([]);
    } finally {
      setLoading(false);
    }
  };

 const handleAddToCart = async (productId) => {
  try {
    if (!token) {
      return show("Please login first", "error");
    }

    const res = await axios.post(
      `${BASE_URL}/cart/add`,
      {
        productId,
        quantity: 1,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data.success) {
      window.dispatchEvent(new Event("cartUpdated"));
      show("Added to cart!", "success");
    }
  } catch (err) {
    console.log(err);

    show(
      err?.response?.data?.message || "Failed to add to cart",
      "error"
    );
  }
};
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await axios.delete(`${BASE_URL}/product/${id}`, {
        headers: getAuthHeader(),
      });

      show("Deleted successfully", "success");
      getProducts();
    } catch {
      show("Delete failed", "error");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-ring">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="loading-text">Loading products…</p>
      </div>
    );
  }

  return (
    <div className="product-page">

      {/* ── PAGE HEADER ── */}
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">All Products</h1>
          <p className="page-sub">Discover our latest collection</p>
        </div>
        <span className="product-count-pill">
          <span className="count-number">{products.length}</span>
          <span className="count-label">items</span>
        </span>
      </div>

      {/* ── PRODUCT GRID ── */}
      <div className="product-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <p className="empty-title">No products found</p>
            <p className="empty-sub">Check back soon for new arrivals</p>
          </div>
        ) : (
          products.map((product) => (
            <div className="product-card" key={product._id}>

              {/* ── IMAGE ── */}
              <Link to={`/product/${product._id}`} className="card-img-link">
                <div className="card-img-wrap">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-img"
                  />
                  <span className={`stock-ribbon ${product.stock > 0 ? "ribbon-in" : "ribbon-out"}`}>
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                  <span className="cat-chip">{product.category}</span>
                </div>
              </Link>

              {/* ── BODY ── */}
              <div className="card-body">

                {/* Brand */}
                <div className="field-block">
                  <label className="field-label">Brand</label>
                  <p className="brand-value">{product.company}</p>
                </div>

                {/* Product Name */}
                <div className="field-block">
                  <label className="field-label">Product Name</label>
                  <Link to={`/product/${product._id}`} className="name-link">
                    <h2 className="product-name">{product.name}</h2>
                  </Link>
                </div>

                {/* Description */}
                <div className="field-block">
                  <label className="field-label">Description</label>
                  <p className="product-desc">{product.description}</p>
                </div>

                {/* Category + Stock */}
                <div className="meta-row">
                  <div className="meta-item">
                    <label className="field-label">Category</label>
                    <span className="meta-val">{product.category}</span>
                  </div>
                  <div className="meta-divider" />
                  <div className="meta-item">
                    <label className="field-label">Stock</label>
                    <span className={`meta-stock ${product.stock > 0 ? "s-in" : "s-out"}`}>
                      {product.stock > 0 ? `${product.stock} units` : "Unavailable"}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div className="price-row">
                  <label className="field-label">Price</label>
                  <span>
                    Rs {Number(product.price).toLocaleString()}
                  </span>
                </div>

              </div>

              {/* ── ACTIONS ── */}
              <div className="card-footer">
                {user?.role !== "admin" && (
                  <button
                    className="btn-cart"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock === 0}
                  >
                    <span className="btn-icon">🛒</span>
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                )}

                {user?.role === "admin" && (
                  <div className="admin-btns">
                    <Link to={`/update/${product._id}`} className="btn-update">
                      <span className="btn-icon">✏️</span> Update
                    </Link>
                    <Link
                      className="btn-delete"
                      onClick={() => handleDelete(product._id)}
                    >
                      <span className="btn-icon">🗑️</span> Delete
                    </Link>
                  </div>
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