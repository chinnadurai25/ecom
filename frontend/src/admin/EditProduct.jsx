import API_BASE_URL from '../api';
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AddProduct.css"; // Reuse styling

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    taxPercentage: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");
  const [loading, setLoading] = useState(true);

  const adminEmail = "admin@gmail.com";

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((data) => setCategories(data));

    // Fetch product details
    fetch(`${API_BASE_URL}/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name,
          category: data.category,
          price: data.price,
          taxPercentage: data.taxPercentage || 0,
          description: data.description || "",
        });
        setCurrentImage(data.image);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch product", err);
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("taxPercentage", form.taxPercentage);
    formData.append("description", form.description);
    formData.append("email", adminEmail);
    if (image) {
      formData.append("image", image);
    }

    const res = await fetch(`${API_BASE_URL}/admin/product/${id}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`
      },
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
        alert("Product updated successfully!");
        navigate("/admin/remove-product");
    } else {
        alert(data.message || "Failed to update product");
    }
  };

  if (loading) return <div className="add-product-page"><h2>Loading...</h2></div>;

  return (
    <div className="add-product-page">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h2>Edit Product</h2>

      <div className="product-form">
        <label>Product Name</label>
        <input
          placeholder="Product name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <label>Category</label>
        <select
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        >
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>

        <label>Price (₹)</label>
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <label>Tax Percentage (%)</label>
        <input
          type="number"
          placeholder="Tax Percentage"
          value={form.taxPercentage}
          onChange={(e) => setForm({ ...form, taxPercentage: e.target.value })}
        />

        <label>Current Image</label>
        {currentImage && (
            <img 
                src={`${API_BASE_URL}${currentImage}`} 
                alt="current" 
                style={{ width: '100px', borderRadius: '8px', marginBottom: '10px' }} 
            />
        )}

        <label className="upload-label">Change Product Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
        />

        <label>Description</label>
        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        <button onClick={handleSubmit}>Update Product</button>
      </div>
    </div>
  );
};

export default EditProduct;



