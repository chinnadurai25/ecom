import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaStore } from "react-icons/fa";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || !user.isAdmin) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-header">
          <h2 className="admin-title">Admin Dashboard</h2>
          <div className="admin-header-btns">
            <button className="view-store-btn" onClick={() => navigate("/home")}>
              <FaStore /> View Store
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        <div className="admin-actions">
          <button onClick={() => navigate("/admin/add-category")}>
            Add Category
          </button>
          <button onClick={() => navigate("/admin/add-product")}>
            Add Product
          </button>
          <button onClick={() => navigate("/admin/remove-product")} style={{ background: "#f59e0b" }}>
            Manage Products
          </button>
          <button onClick={() => navigate("/admin/orders")} style={{ background: "#3b82f6" }}>
            Placed Orders
          </button>
          <button onClick={() => navigate("/admin/support")} style={{ background: "#8b5cf6" }}>
            Customer Support
          </button>
          <button onClick={() => navigate("/admin/settings")} style={{ background: "#10b981" }}>
            Store Settings
          </button>
        </div>


      </div>
    </div>
  );
};

export default AdminDashboard;
