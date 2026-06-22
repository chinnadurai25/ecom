import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../api';
import './AdminSettings.css';

const AdminSettings = () => {
  const [shippingAmount, setShippingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || !user.isAdmin) {
      navigate("/login");
      return;
    }

    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        setShippingAmount(data.shippingAmount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/admin/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAmount: Number(shippingAmount) })
      });
      if (res.ok) {
        alert("Settings updated successfully!");
      } else {
        alert("Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="settings-loading">Loading...</div>;

  return (
    <div className="admin-page">
      <div className="settings-container">
        <button className="back-btn" onClick={() => navigate("/admin")}>
          &larr; Back to Dashboard
        </button>
        <h2 className="settings-title">Store Settings</h2>
        
        <form onSubmit={handleSave} className="settings-form">
          <div className="form-group">
            <label>Flat Shipping Amount (₹)</label>
            <input 
              type="number" 
              min="0" 
              step="0.01" 
              value={shippingAmount} 
              onChange={(e) => setShippingAmount(e.target.value)} 
              required
            />
            <small>This amount will be applied to all orders during checkout.</small>
          </div>
          
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
