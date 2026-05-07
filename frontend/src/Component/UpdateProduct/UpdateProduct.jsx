import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import BASE_URL from "../../api";
import "./UpdateProduct.css";

const UpdateProduct = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    company: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const navigate = useNavigate();

  let token = null;

  try {
    const stored = JSON.parse(localStorage.getItem("user"));
    token = stored?.token;
  } catch {
    token = null;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchProduct = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/product/${id}`);

      if (res.data?.data) {
        setForm(res.data.data);
      }
    } catch (err) {
      console.log(err);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProduct();
  }, [id, fetchProduct]);

  // ================= UPDATE =================
  const handleUpdate = async () => {
    if (!token) {
      alert("Login required");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("company", form.company);
      formData.append("category", form.category);

      if (image) {
        formData.append("image", image);
      }

      await axios.put(`${BASE_URL}/product/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Updated successfully");
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!token) {
      alert("Login required");
      navigate("/login");
      return;
    }

    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${BASE_URL}/product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Product deleted");
      navigate("/");
    } catch (err) {
      alert(err?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="addProduct">
      <h1>Update Product</h1>

      <div className="auth-container">
        <input
          className="inputBox"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
        />

        <input
          className="inputBox"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
        />

        <input
          className="inputBox"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
        />

        <input
          className="inputBox"
          name="category"
          value={form.category}
          onChange={handleChange}
          placeholder="Category"
        />

        <input
          className="inputBox"
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <button
          className="appButton"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Product"}
        </button>

        {/* 🔥 DELETE BUTTON */}
        <button
          className="appButton"
          style={{ background: "red" }}
          onClick={handleDelete}
        >
          Delete Product
        </button>
      </div>
    </div>
  );
};

export default UpdateProduct;