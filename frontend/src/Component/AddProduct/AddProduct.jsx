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
        if (value !== '') formData.append(key, value);
      });

      formData.append('userId', user._id);
      formData.append('image', image);

      await axios.post(`${BASE_URL}/add-product`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
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

  const fields = [
    { name: 'name', placeholder: 'Product name', type: 'text' },
    { name: 'price', placeholder: 'Price', type: 'number' },
    { name: 'category', placeholder: 'Category', type: 'text' },
    { name: 'company', placeholder: 'Company', type: 'text' },
    { name: 'stock', placeholder: 'Stock (optional)', type: 'number' }
  ];

  return (
    <div className="addProduct">
      <h1>Add Product</h1>

      <div className="auth-container">

        {fields.map(f => (
          <div key={f.name}>
            <input
              type={f.type}
              name={f.name}
              value={form[f.name]}
              onChange={handleChange}
              placeholder={f.placeholder}
              className={`inputBox ${errors[f.name] ? 'error' : ''}`}
            />
            {errors[f.name] && <p className="errorText">{errors[f.name]}</p>}
          </div>
        ))}

        {/* Description */}
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
          className="inputBox textarea"
          rows={3}
        />

        {/* Image Upload */}
        <div>
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

        <button onClick={handleSubmit} disabled={loading} className="appButton">
          {loading ? 'Adding...' : 'Add Product'}
        </button>

      </div>
    </div>
  );
};

export default AddProduct;