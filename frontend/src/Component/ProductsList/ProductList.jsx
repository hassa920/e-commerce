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
      if (!token) return show("Please login first", "error");

      await axios.post(
        `${BASE_URL}/cart/add`,
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      window.dispatchEvent(new Event("cartUpdated"));
      show("Added to cart!", "success");
    } catch (err) {
      show(err?.response?.data?.message || "Failed", "error");
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
    } catch (err) {
      show("Delete failed", "error");
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  if (loading) return <h2 className="loading-text">Loading...</h2>;

  return (
    <div className="product-page">

      <h1 className="page-title">🛍 Products</h1>

      <div className="product-grid">

        {products.length === 0 ? (
          <p className="no-products">No products found</p>
        ) : (
          products.map((product) => (
            <div className="product-card" key={product._id}>

              <Link to={`/product/${product._id}`} className="card-image-link">
                <div className="card-image-wrapper">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card-image"
                  />
                </div>
              </Link>

              <div className="card-body">

                <Link to={`/product/${product._id}`} className="product-name-link">
                  <p className="product-name">{product.name}</p>
                </Link>

                <p className="product-meta">
                  {product.company} • {product.category}
                </p>

                <p className="product-price">
                  Rs {Number(product.price).toLocaleString()}
                </p>

                <span
                  className={`stock-badge ${
                    product.stock > 0 ? "in-stock" : "out-of-stock"
                  }`}
                >
                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                </span>

              </div>

              <div className="card-actions">

                {user?.role !== "admin" && (
                  <button
                    className="btn btn-cart"
                    onClick={() => handleAddToCart(product._id)}
                  >
                    🛒 Add to Cart
                  </button>
                )}

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
                      🗑 Delete
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