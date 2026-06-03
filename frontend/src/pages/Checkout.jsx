import API_BASE_URL from '../api';
import React, { useState } from 'react';
import { useCart } from "../context/CartContext";
import { ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Checkout.css';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // State for selection logic
  const [selectedShipping, setSelectedShipping] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('card');

  // State for shipping information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: ''
  });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingCosts = { standard: 0, express: 9.99, overnight: 24.99 };
  const shippingCost = shippingCosts[selectedShipping];
  const tax = subtotal * 0.08;
  const total = subtotal + tax + shippingCost;

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place an order");
      navigate("/auth", { state: { fromCheckout: true } });
      return;
    }

    if (!shippingInfo.firstName || !shippingInfo.address) {
      alert("Please fill in the required shipping information");
      return;
    }

    try {
      const orderPromises = cart.map(item =>
        fetch(`${API_BASE_URL}/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productName: item.name,
            productId: item._id || item.id,
            quantity: item.qty,
            price: item.price * item.qty,
            userEmail: user.email,
            userName: user.name,
            shippingAddress: shippingInfo,
            shippingMethod: selectedShipping,
            paymentMethod: selectedPayment,
            shippingCost: shippingCost
          })
        })
      );

      await Promise.all(orderPromises);
      if (clearCart) clearCart();
      navigate('/order-success', { state: { purchasedItems: cart } });
    } catch (error) {
      console.error("Order failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">

        {/* Navigation */}
        <div className="back-to-cart" onClick={() => navigate("/cart")}>
          <ChevronLeft size={18} /> Back to Cart
        </div>

        <h1 className="checkout-title">Secure Checkout</h1>

        <div className="checkout-grid">

          {/* LEFT COLUMN: FORMS */}
          <div className="checkout-main">

            {/* Step 1: Shipping Information */}
            <section className="checkout-card">
              <div className="step-header">
                <span className="step-num">1</span>
                <h3>Shipping Information</h3>
              </div>
              <div className="input-grid">
                <div className="field">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={shippingInfo.firstName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={shippingInfo.lastName}
                    onChange={handleShippingChange}
                  />
                </div>
                <div className="field full">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="john@example.com"
                    value={shippingInfo.email}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="field full">
                  <label>Street Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="123 Main Street"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
              </div>
            </section>

            {/* Step 2: Shipping Method */}
            <section className="checkout-card">
              <div className="step-header">
                <span className="step-num">2</span>
                <h3>Shipping Method</h3>
              </div>
              <div className="method-selection-container">
                <label className={`method-option ${selectedShipping === 'standard' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="shipping"
                    onChange={() => setSelectedShipping('standard')}
                    checked={selectedShipping === 'standard'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details">
                    <span className="method-title">Standard Shipping <span className="method-time">5-7 business days</span></span>
                  </div>
                  <span className="method-price free">FREE</span>
                </label>

                <label className={`method-option ${selectedShipping === 'express' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="shipping"
                    onChange={() => setSelectedShipping('express')}
                    checked={selectedShipping === 'express'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details">
                    <span className="method-title">Express Shipping <span className="method-time">2-3 business days</span></span>
                  </div>
                  <span className="method-price">₹9.99</span>
                </label>

                <label className={`method-option ${selectedShipping === 'overnight' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="shipping"
                    onChange={() => setSelectedShipping('overnight')}
                    checked={selectedShipping === 'overnight'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details">
                    <span className="method-title">Overnight Shipping <span className="method-time">Next business day</span></span>
                  </div>
                  <span className="method-price">₹24.99</span>
                </label>
              </div>
            </section>

            {/* Step 3: Payment Method */}
            <section className="checkout-card">
              <div className="step-header">
                <span className="step-num">3</span>
                <h3>Payment Method</h3>
              </div>
              <div className="payment-selection-container">

                {/* 1. Credit Card */}
                <label className={`method-option ${selectedPayment === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('card')}
                    checked={selectedPayment === 'card'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details"><span className="method-title">Credit / Debit Card</span></div>
                  <div className="card-icons">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" />
                  </div>
                </label>

                {selectedPayment === 'card' && (
                  <div className="payment-form">
                    <div className="field full">
                      <label>Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="input-grid">
                      <div className="field">
                        <label>Expiry Date</label>
                        <input type="text" placeholder="MM/YY" />
                      </div>
                      <div className="field">
                        <label>CVV</label>
                        <input type="text" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Google Pay */}
                <label className={`method-option ${selectedPayment === 'gpay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('gpay')}
                    checked={selectedPayment === 'gpay'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details"><span className="method-title">Google Pay (UPI)</span></div>
                  <div className="card-icons">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" style={{ height: '16px' }} />
                  </div>
                </label>

                {/* 3. Apple Pay */}
                <label className={`method-option ${selectedPayment === 'apple' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('apple')}
                    checked={selectedPayment === 'apple'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details"><span className="method-title">Apple Pay</span></div>
                  <div className="card-icons">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Apple_Pay_logo.svg" alt="Apple Pay" style={{ height: '18px' }} />
                  </div>
                </label>

                {/* 4. PayPal */}
                <label className={`method-option ${selectedPayment === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('paypal')}
                    checked={selectedPayment === 'paypal'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details"><span className="method-title">PayPal</span></div>
                </label>

                {/* 5. Cash on Delivery */}
                <label className={`method-option ${selectedPayment === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('cod')}
                    checked={selectedPayment === 'cod'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details">
                    <span className="method-title">Cash on Delivery (COD)</span>
                    <p className="method-desc" style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
                      Pay when you receive the package.
                    </p>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <aside className="checkout-sidebar">
            <div className="summary-card">
              <h3>Order Summary</h3>

              <div className="itemized-list">
                {cart.map(item => (
                  <div key={item.id} className="summary-product">
                    {/* ✅ Robust Image Loading Logic */}
                    <img
                      src={(item.image || item.img || "").startsWith("/")
                        ? `${API_BASE_URL}${item.image || item.img}`
                        : (item.image || item.img || "https://via.placeholder.com/80")}
                      alt={item.name}
                    />
                    <div className="sp-details">
                      <p className="sp-name">{item.name}</p>
                      <p className="sp-qty">Qty: {item.qty}</p>
                      <p className="sp-price">₹{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="summary-totals">
                <div className="total-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="total-row">
                  <span>Shipping</span>
                  <span className={shippingCost === 0 ? "free" : ""}>
                    {shippingCost === 0 ? "FREE" : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="total-row">
                  <span>Tax (8%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="total-row final">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button className="place-order-btn" onClick={handlePlaceOrder}>
                <Lock size={16} />
                {selectedPayment === 'cod' ? 'Confirm Order' : 'Place Order'}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


