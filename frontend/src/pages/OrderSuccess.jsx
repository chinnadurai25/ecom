import API_BASE_URL from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, Truck, ArrowRight, Star } from 'lucide-react';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderNumber] = useState(Math.floor(100000 + Math.random() * 900000));

  // Get purchased items from navigation state
  const purchasedItems = location.state?.purchasedItems || [];
  const itemToRate = purchasedItems.length > 0 ? purchasedItems[0] : null;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [skippedRating, setSkippedRating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert("Please select a star rating to continue.");
      return;
    }

    if (!itemToRate || !user) {
      // Fallback if no item or user, just let them proceed
      setHasRated(true);
      return;
    }

    setIsSubmitting(true);

    // Using FormData to match existing backend endpoint
    const formData = new FormData();
    formData.append("productId", itemToRate._id || itemToRate.id);
    formData.append("userEmail", user.email);
    formData.append("userName", user.name);
    formData.append("rating", rating);
    formData.append("comment", comment);

    try {
      const res = await fetch(`${API_BASE_URL}/reviews`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setHasRated(true); // Unlock the "Continue Shopping" button
        alert("Thank you for your feedback!");
      } else {
        alert("Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting review");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="success-page">
      <div className="success-card">

        {/* Success Header */}
        {!hasRated && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div className="check-container">
              <div className="check-bg-pulse"></div>
              <CheckCircle size={80} className="main-check-icon" />
            </div>
            <h1 className="success-title">Order Placed!</h1>
            <p className="success-subtitle">Order #{orderNumber}</p>
          </div>
        )}

        {/* RATING SECTION (OPTIONAL) */}
        {!hasRated && itemToRate ? (
          <div className="mandatory-rating-section" style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '10px', textAlign: 'center' }}>
              How was your experience?
            </h3>
            <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '20px', fontSize: '0.9rem' }}>
              Please rate <strong>{itemToRate.name}</strong> or skip to continue shopping.
            </p>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={32}
                  fill={star <= (hover || rating) ? "#fbbf24" : "none"}
                  color={star <= (hover || rating) ? "#fbbf24" : "#d1d5db"}
                  style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            {/* Comment */}
            <textarea
              placeholder="Write a quick review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '80px', marginBottom: '15px' }}
            />

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmitReview}
                disabled={isSubmitting}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.7 : 1
                }}
              >
                {isSubmitting ? "Submitting..." : "Submit & Continue"}
              </button>

              <button
                onClick={() => {
                  setSkippedRating(true);
                  setHasRated(true);
                }}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#f3f4f6',
                  color: '#4b5563',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Skip
              </button>
            </div>
          </div>
        ) : (
          /* Normal Success View (Shown ONLY after rating or if no item to rate) */
          <>
            {hasRated && (
              <div style={{ textAlign: 'center', animation: 'fadeIn 0.5s' }}>
                <div className="check-container">
                  <CheckCircle size={80} className="main-check-icon" style={{ color: '#10b981' }} />
                </div>
                <h2 style={{ color: '#10b981', marginBottom: '10px' }}>
                  {skippedRating ? "Thank you!" : "All set!"}
                </h2>
                <p style={{ color: '#6b7280', marginBottom: '30px' }}>
                  {skippedRating ? "Your order is on the way." : "Thanks for your rating."}
                </p>
              </div>
            )}

            <div className="animation-box">
              <div className="road">
                <div className="moving-vehicle">
                  <Truck size={40} className="truck-icon" />
                  <div className="speed-lines">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="success-actions">
              <button className="btn-primary" onClick={() => navigate('/home')}>
                Continue Shopping <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;


