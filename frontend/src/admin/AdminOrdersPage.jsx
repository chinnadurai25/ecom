import API_BASE_URL from '../api';
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Clock, MapPin } from "lucide-react";
import "./AdminOrdersPage.css";

const STATUS_OPTIONS = [
  "Ordered",
  "Packed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedShippingOrder, setSelectedShippingOrder] = useState(null);

  // ✅ AUTH CHECK
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user || !user.isAdmin) {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      let url = `${API_BASE_URL}/admin/orders`;
      if (fromDate && toDate) {
        url += `?from=${fromDate}&to=${toDate}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch orders: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Orders data:", data); // Debugging log

      if (data && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        console.error("Invalid data format:", data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
      alert(`Error loading orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ UPDATE STATUS
  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("token");

    await fetch(`${API_BASE_URL}/admin/orders/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    fetchOrders();
  };

  return (
    <div className="admin-orders-page">
      <div className="ao-container">
        <div className="ao-header">
          <button className="back-btn" onClick={() => navigate("/admin")}>
            <ArrowLeft size={20} /> Back
          </button>
          <h2>Placed Orders</h2>
        </div>

        {/* 🔄 LOADING */}
        {loading && (
          <div className="loading-state">
            <Clock size={40} className="spin" />
            <p>Loading orders...</p>
          </div>
        )}

        {/* 📭 EMPTY */}
        {!loading && orders.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>No orders found</p>
          </div>
        )}

        {/* 📦 TABLE */}
        {!loading && orders.length > 0 && (
          <>
            <div className="filter-bar">
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
              <button className="filter-btn" onClick={fetchOrders}>
                Filter
              </button>
            </div>

            <div className="table-wrapper">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Date</th>
                    <th>Details</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <span className="order-id">#{o._id?.slice(-6) || 'N/A'}</span>
                        {o.status === "Cancelled" && (
                          <span style={{
                            marginLeft: '8px',
                            background: '#fee2e2',
                            color: '#b91c1c',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            border: '1px solid #fca5a5',
                            display: 'inline-block'
                          }}>
                            CANCELLED
                          </span>
                        )}
                      </td>
                      <td>
                        <b>{o.userName || 'Unknown'}</b>
                        <br />
                        <small>{o.userEmail || 'No Email'}</small>
                      </td>
                      <td>{o.productName || 'Unknown Product'}</td>
                      <td>{o.quantity || 0}</td>
                      <td>₹{o.price || 0}</td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}</td>
                      <td>
                        {o.shippingAddress ? (
                          <button
                            className="view-address-btn"
                            onClick={() => setSelectedShippingOrder(o)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#f3f4f6',
                              border: '1px solid #d1d5db',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              color: '#374151',
                              fontSize: '13px'
                            }}
                          >
                            <MapPin size={14} style={{ color: '#4f46e5' }} /> View Address
                          </button>
                        ) : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '12px' }}>
                            No details
                          </span>
                        )}
                      </td>
                      <td>
                        <select
                          value={o.status || "Ordered"}
                          className={`status-select ${(o.status || "ordered").toLowerCase()}`}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Shipping Details Modal */}
            {selectedShippingOrder && (
              <div className="ao-modal-overlay" onClick={() => setSelectedShippingOrder(null)} style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
              }}>
                <div className="ao-modal-content" onClick={(e) => e.stopPropagation()} style={{
                  background: 'white',
                  padding: '30px',
                  borderRadius: '12px',
                  width: '95%',
                  maxWidth: '450px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                  textAlign: 'left'
                }}>
                  <h3 style={{ margin: '0 0 20px 0', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', fontSize: '1.25rem', color: '#111827' }}>
                    Shipping Address & Details
                  </h3>
                  
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recipient Name</strong>
                      <span style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                        {selectedShippingOrder.shippingAddress?.firstName} {selectedShippingOrder.shippingAddress?.lastName}
                      </span>
                    </div>
                    
                    <div>
                      <strong style={{ display: 'block', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</strong>
                      <span style={{ fontSize: '15px', color: '#111827', fontWeight: '500' }}>
                        {selectedShippingOrder.shippingAddress?.phone || 'N/A'}
                      </span>
                    </div>
                    
                    <div>
                      <strong style={{ display: 'block', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Address</strong>
                      <span style={{ fontSize: '15px', color: '#111827', fontWeight: '500', display: 'block', lineHeight: '1.4' }}>
                        {selectedShippingOrder.shippingAddress?.address}
                      </span>
                    </div>

                    <div>
                      <strong style={{ display: 'block', fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Email</strong>
                      <span style={{ fontSize: '14px', color: '#4b5563' }}>
                        {selectedShippingOrder.userEmail}
                      </span>
                    </div>
                  </div>
                  
                  <button onClick={() => setSelectedShippingOrder(null)} style={{
                    marginTop: '25px',
                    width: '100%',
                    background: '#7c3aed',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(124, 58, 237, 0.2)'
                  }}>
                    Close
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;



