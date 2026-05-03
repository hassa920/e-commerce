import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './UpdateProduct.css';
import { useParams,useNavigate } from 'react-router-dom';
import BASE_URL from '../../api';

const initialForm = { name: "", price: "", company: "", category: "" };

const UpdateProduct = () => {
    const [form, setForm] = useState(initialForm);
    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const { id } = useParams();
    const navigate=useNavigate();
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

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    useEffect(() => {
        if (id) {
            getProductDetails();
        }
    }, [id]);

    const getProductDetails = async () => {
        try {
            const res = await axios.get(`${BASE_URL}/product/${id}`); // ✅ Using BASE_URL
            if (res.data?.success) {
                const data = res.data.data;
                // ✅ Pre-fill the form with existing product data
                setForm({
                    name: data.name || "",
                    price: data.price || "",
                    category: data.category || "",
                    company: data.company || "",
                });
            } else {
                console.warn("Product not found");
            }
        } catch (err) {
            console.error("Error:", err?.response?.data?.message || err.message);
        }
    };

  const handleSubmit = async () => {
  if (!validate()) return;

  const user = getLoggedInUser();
  const userId = user?._id;

  if (!userId) {
    alert("You must be logged in to update a product.");
    return;
  }

  try {
    setLoading(true);

    if (image) {
      // ✅ New image selected — send as FormData (multipart)
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("category", form.category);
      formData.append("company", form.company);
      formData.append("userId", userId);
      formData.append("image", image);

      await axios.put(`${BASE_URL}/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

    } else {
      // ✅ No new image — send plain JSON, backend keeps existing image
      await axios.put(`${BASE_URL}/product/${id}`, {
        name: form.name,
        price: form.price,
        category: form.category,
        company: form.company,
        userId,
      });
    }

    alert("Product Updated Successfully");
    navigate("/");
    setImage(null);
    setErrors({});

  } catch (err) {
    console.error("Update product failed:", err);
    alert(err?.response?.data?.message || "Error occurred while updating product");
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
            <h1>Update Product</h1>
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
                    {loading ? "Updating..." : "Update Product"}
                </button>

            </div>
        </div>
    );
};

export default UpdateProduct;