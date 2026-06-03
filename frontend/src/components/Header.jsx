import API_BASE_URL from '../api';
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaBars,
  FaMapMarkerAlt,
  FaSignOutAlt,
  FaBoxOpen,
  FaTimes // Added close icon
} from "react-icons/fa";
import "./Header.css";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

import logo from "../assets/logo.png";

const Header = ({ onSearch }) => {
  const [showCategories, setShowCategories] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };
  const [categories, setCategories] = useState([]);

  const { wishlist } = useWishlist();
  const { cart } = useCart(); // ✅ cart count
  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Categories:", data); // Debugging line
        setCategories(data);
      })
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  return (
    <header className="sh-header">
      {/* Top Banner */}
      <div className="top-banner">
        <div className="container banner-flex">
          <div className="delivery-loc">
            {/* Delivery info removed */}
          </div>
          <div className="top-links">
            <Link to="/customer-service">Customer Service</Link>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="main-nav container">
        <Link to="/home" className="logo-brand">
          <img src={logo} alt="VEDAN Logo" className="brand-logo-img" />
          VEDAN
        </Link>

        {/* Search Bar - Moved outside nav-content for mobile visibility */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search for products..."
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
          <button className="search-btn">
            <FaSearch />
          </button>
        </div>

        <div className="mobile-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </div>

        <div className={`nav-content ${isMobileMenuOpen ? "open" : ""}`}>

          <div className="nav-icons">
            <Link to="/profile" className="icon-link" onClick={() => setIsMobileMenuOpen(false)}>
              <FaUser />
              <span className="mobile-label">Profile</span>
            </Link>

            <Link to="/orders" className="icon-link" title="My Orders" onClick={() => setIsMobileMenuOpen(false)}>
              <FaBoxOpen />
              <span className="mobile-label">Orders</span>
            </Link>

            {/* ❤️ Wishlist */}
            <Link to="/wishlist" className="icon-link" onClick={() => setIsMobileMenuOpen(false)}>
              <FaHeart />
              {wishlist.length > 0 && (
                <span className="cart-badge">{wishlist.length}</span>
              )}
              <span className="mobile-label">Wishlist</span>
            </Link>

            {/* 🛒 Cart */}
            <Link to="/cart" className="icon-link" onClick={() => setIsMobileMenuOpen(false)}>
              <FaShoppingCart />
              {cart.length > 0 && (
                <span className="cart-badge">
                  {cart.reduce((sum, i) => sum + i.qty, 0)}
                </span>
              )}
              <span className="mobile-label">Cart</span>
            </Link>

            {/* 🚪 Login / Logout */}
            {localStorage.getItem("user") ? (
              <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="icon-link" style={{ background: "none", border: "none", cursor: "pointer" }}>
                <FaSignOutAlt />
                <span className="mobile-label">Logout</span>
              </button>
            ) : (
              <Link to="/auth" className="icon-link" onClick={() => setIsMobileMenuOpen(false)}>
                <FaSignOutAlt style={{ transform: "rotate(180deg)" }} />
                <span className="mobile-label">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <nav className="categories-bar">
        <div className="container categories-flex">
          <div
            className="all-categories"
            onClick={() => setShowCategories(!showCategories)}
          >
            <FaBars />
            <span>All Categories</span>
          </div>

          <div className="cat-links">
            {categories && categories.map((cat) => {
              const rawName = cat.name || "";
              const name = rawName.toLowerCase().trim();

              const getIcon = (catName) => {
                if (!catName) return "📦";
                if (catName.includes("men")) return "👕";
                if (catName.includes("women")) return "👗";
                if (catName.includes("kid")) return "👶";
                if (catName.includes("toy")) return "🧸";
                if (catName.includes("shoe") || catName.includes("foot")) return "👟";
                if (catName.includes("watch")) return "⌚";
                if (catName.includes("sport")) return "⚽";
                if (catName.includes("sale")) return "🔥";
                if (catName.includes("bag") || catName.includes("access")) return "👜";
                return "📦";
              };

              return (
                <Link
                  key={cat._id}
                  to={`/category/${rawName}`}
                  className="cat-item"
                >
                  <span className={`cat-icon-wrapper ${name.replace(/\s+/g, '-') || 'default'}`}>
                    {getIcon(name)}
                  </span>
                  {rawName || "Category"}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
