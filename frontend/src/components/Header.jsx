import API_BASE_URL from '../api';
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaUser,
  FaHeart,
  FaShoppingCart,
  FaBars,
  FaSignOutAlt,
  FaSignInAlt,
  FaBoxOpen,
  FaTimes,
  FaChevronDown
} from "react-icons/fa";
import "./Header.css";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

import logo from "../assets/logo.png";

const Header = ({ onSearch }) => {
  const [showCategories, setShowCategories] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  })();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage")); // Notify CartContext
    setUserDropdownOpen(false);
    navigate("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [categories, setCategories] = useState([]);

  const { wishlist } = useWishlist();
  const { cart } = useCart();
  useEffect(() => {
    fetch(`${API_BASE_URL}/categories`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched Categories:", data);
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

            {/* 👤 User Avatar / Login */}
            {user ? (
              <div className="user-avatar-wrap" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-label="User menu"
                >
                  <div className="avatar-circle">
                    {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                  </div>
                  <FaChevronDown className={`avatar-chevron ${userDropdownOpen ? "open" : ""}`} />
                </button>

                {userDropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : <FaUser />}
                      </div>
                      <div>
                        <p className="dropdown-name">{user.name || "User"}</p>
                        <p className="dropdown-email">{user.email || ""}</p>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => { setUserDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      <FaUser /> My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="dropdown-item"
                      onClick={() => { setUserDropdownOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      <FaBoxOpen /> My Orders
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item dropdown-logout"
                      onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    >
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/auth"
                className="nav-login-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaSignInAlt />
                <span>Login</span>
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
