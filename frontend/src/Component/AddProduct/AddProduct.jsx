import React, { useState } from 'react';
import axios from 'axios';
import './AddProduct.css';
import BASE_URL from '../../api';

const initialForm = { name: "", price: "", company: "", category: "" };

const AddProduct = () => {
    const [form, setForm] = useState(initialForm);
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const getLoggedInUser = () => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0] || null);
        setErrors((prev) => ({ ...prev, image: "" }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Product name is required";
        if (!form.price.toString().trim()) newErrors.price = "Price is required";
        else if (isNaN(Number(form.price))) newErrors.price = "Price must be a number";
        if (!form.category.trim()) newErrors.category = "Category is required";
        if (!form.company.trim()) newErrors.company = "Company is required";
        if (!image) newErrors.image = "Product image is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const user = getLoggedInUser();
        const userId = user?._id;

        if (!userId) {
            alert("You must be logged in to add a product.");
            return;
        }

        try {
            setLoading(true);

            // ✅ GET TOKEN FROM LOCALSTORAGE
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("price", form.price);
            formData.append("category", form.category);
            formData.append("company", form.company);
            formData.append("userId", userId);
            formData.append("image", image);

            await axios.post(`${BASE_URL}/add-product`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`  // ✅ THIS WAS MISSING
                },
            });

            alert("Product Created Successfully");
            setForm(initialForm);
            setImage(null);
            setErrors({});
        } catch (err) {
            console.error("Add product failed:", err);
            alert(err?.response?.data?.message || "Error occurred while adding product");
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: "name", placeholder: "Product name" },
        { name: "price", placeholder: "Price" },
        { name: "category", placeholder: "Category" },
        { name: "company", placeholder: "Company" },
    ];

    return (
       <div className="addProduct">
        <h1>Add Product</h1>
        <div className="auth-container">

            {fields.map((f) => (
                <div key={f.name}>
                    <input
                        type="text"
                        name={f.name}
                        value={form[f.name]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        className={`inputBox ${errors[f.name] ? "error" : ""}`}
                    />
                    {errors[f.name] && (
                        <p className="errorText">{errors[f.name]}</p>
                    )}
                </div>
            ))}

            <div>
                <input
                    type="file"
                    onChange={handleImageChange}
                    className={`inputBox ${errors.image ? "error" : ""}`}
                />
                {errors.image && (
                    <p className="errorText">{errors.image}</p>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                className="appButton"
            >
                {loading ? "Adding..." : "Add Product"}
            </button>

        </div>
    </div>
    );
};

export default AddProduct;