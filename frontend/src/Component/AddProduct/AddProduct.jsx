import React, { useState } from 'react';
import axios from 'axios';
import './AddProduct.css';
import BASE_URL from '../../api';
import { useToast } from '../Toast/Toast';

const initialForm = {
  name: '',
  price: '',
  company: '',
  category: '',
  description: '',
  stock: ''
};

const AddProduct = () => {
  const { show } = useToast();
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem('user'));
  } catch {
    storedUser = null;
  }

  const user = storedUser?.user;
  const token = storedUser?.token;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.price.toString().trim()) e.price = 'Price is required';
    if (isNaN(Number(form.price))) e.price = 'Price must be number';
    if (!form.category.trim()) e.category = 'Category is required';
    if (!form.company.trim()) e.company = 'Company is required';
    if (!image) e.image = 'Image is required';
    if (form.stock && isNaN(Number(form.stock))) e.stock = 'Stock must be number';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (!user || !token) {
      show('You must be logged in', 'error');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value === undefined || value === null ? "" : value);
      });
      formData.append('userId', user._id);
      formData.append('image', image);

      await axios.post(`${BASE_URL}/add-product`, formData, {
        headers: {
          // 'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      show('Product added successfully 🎉', 'success');

      setForm(initialForm);
      setImage(null);
      setPreview(null);
      setErrors({});

    } catch (err) {
      console.log(err?.response?.data || err.message);
      show(
        err?.response?.data?.message ||
        'Failed to add product (check login or admin access)',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="addProduct">
      <h1>Add Product</h1>

      <div className="auth-container">

        {/* NAME */}
        <div className="form-group">
          <label className="form-label">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter product name"
            className="inputBox"
          />
          {errors.name && <p className="errorText">{errors.name}</p>}
        </div>

        {/* PRICE */}
        <div className="form-group">
          <label className="form-label">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Enter price"
            className="inputBox"
          />
          {errors.price && <p className="errorText">{errors.price}</p>}
        </div>

        {/* CATEGORY */}
        <div className="form-group">
          <label className="form-label">Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Enter category"
            className="inputBox"
          />
          {errors.category && <p className="errorText">{errors.category}</p>}
        </div>

        {/* COMPANY */}
        <div className="form-group">
          <label className="form-label">Company</label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={handleChange}
            placeholder="Enter company"
            className="inputBox"
          />
          {errors.company && <p className="errorText">{errors.company}</p>}
        </div>

        {/* STOCK */}
        <div className="form-group">
          <label className="form-label">Stock (Optional)</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            placeholder="Enter stock"
            className="inputBox"
          />
          {errors.stock && <p className="errorText">{errors.stock}</p>}
        </div>

        {/* DESCRIPTION */}
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Enter description"
            className="inputBox textarea"
            rows={3}
          />
        </div>

        {/* IMAGE */}
        <div className="form-group">
          <label className="form-label">Product Image</label>

          <label htmlFor="img" className="img-upload-label">
            {preview ? (
              <img src={preview} alt="preview" className="img-preview" />
            ) : (
              <div className="img-placeholder">📷 Upload Image</div>
            )}
          </label>

          <input
            id="img"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden-file-input"
          />

          {errors.image && <p className="errorText">{errors.image}</p>}
        </div>

        {/* BUTTON */}
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Adding...' : 'Add Product'}
        </button>

      </div>
    </div>
  );
};

export default AddProduct;