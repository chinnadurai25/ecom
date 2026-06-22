import API_BASE_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useCart } from "../context/CartContext";
import { ChevronLeft, Lock } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import './Checkout.css';

const Checkout = () => {
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  // State for selection logic
  const selectedShipping = 'standard';
  const [selectedPayment, setSelectedPayment] = useState('razorpay');

  // State for shipping information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    address: ''
  });

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const [shippingCost, setShippingCost] = useState(0);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          setShippingCost(data.shippingAmount || 0);
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      }
    };
    fetchSettings();
  }, []);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tax = cart.reduce((acc, item) => acc + (item.price * item.qty) * ((item.taxPercentage || 0) / 100), 0);
  const total = subtotal + tax + shippingCost;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place an order");
      navigate("/auth", { state: { fromCheckout: true } });
      return;
    }

    if (!shippingInfo.firstName || !shippingInfo.address || !shippingInfo.phone) {
      alert("Please fill in the required shipping information (including Phone Number)");
      return;
    }

    if (selectedPayment === 'razorpay' || selectedPayment === 'gpay' || selectedPayment === 'phonepe') {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("Failed to load Razorpay SDK. Please check your internet connection.");
        return;
      }

      try {
        // 1. Create order on backend
        const orderResponse = await fetch(`${API_BASE_URL}/razorpay/order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: total }),
        });

        if (!orderResponse.ok) {
          throw new Error("Failed to initiate Razorpay order");
        }

        const razorpayOrder = await orderResponse.json();

        // Prefill method if UPI (gpay / phonepe) is chosen
        const prefillMethod = (selectedPayment === 'gpay' || selectedPayment === 'phonepe') ? 'upi' : undefined;

        // 2. Open Razorpay Checkout
        const options = {
          key: razorpayOrder.key_id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "VEDAN Store",
          description: "Order Checkout Payment",
          image: "https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg",
          order_id: razorpayOrder.id,
          handler: async function (response) {
            try {
              // 3. Verify signature and create orders in database
              const verifyResponse = await fetch(`${API_BASE_URL}/razorpay/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderDetails: {
                    userEmail: user.email,
                    userName: user.name,
                    items: cart.map(item => ({
                      name: item.name,
                      productId: item.productId || item._id || item.id,
                      qty: item.qty,
                      price: item.price,
                    })),
                    shippingAddress: shippingInfo,
                  }
                }),
              });

              if (!verifyResponse.ok) {
                const errData = await verifyResponse.json();
                throw new Error(errData.message || "Payment verification failed");
              }

              if (clearCart) await clearCart();
              navigate('/order-success', { state: { purchasedItems: cart } });
            } catch (err) {
              console.error("Payment verification error:", err);
              alert(`Payment verification failed: ${err.message}`);
            }
          },
          prefill: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email,
            contact: shippingInfo.phone,
            method: prefillMethod
          },
          theme: {
            color: "#1e293b",
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

      } catch (error) {
        console.error("Razorpay placement failed:", error);
        alert("Failed to initiate Razorpay transaction. Please try again.");
      }
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
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    value={shippingInfo.phone}
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

            {/* Step 2: Payment Method */}
            <section className="checkout-card">
              <div className="step-header">
                <span className="step-num">2</span>
                <h3>Payment Method</h3>
              </div>
              <div className="payment-selection-container">

                {/* Razorpay */}
                <label className={`method-option ${selectedPayment === 'razorpay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('razorpay')}
                    checked={selectedPayment === 'razorpay'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details">
                    <span className="method-title">Razorpay (Cards, Netbanking, UPI)</span>
                  </div>
                  <div className="card-icons">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" style={{ height: '14px' }} />
                  </div>
                </label>

                {/* Google Pay */}
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

                {/* PhonePe */}
                <label className={`method-option ${selectedPayment === 'phonepe' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    onChange={() => setSelectedPayment('phonepe')}
                    checked={selectedPayment === 'phonepe'}
                  />
                  <span className="custom-radio"></span>
                  <div className="method-details"><span className="method-title">PhonePe</span></div>
                  <div className="card-icons">
                    <img src="https://cdn.simpleicons.org/phonepe" alt="PhonePe" style={{ height: '18px' }} />
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
                  <span>Tax</span>
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
                Place Order
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;


