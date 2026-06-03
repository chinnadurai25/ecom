import API_BASE_URL from '../api';
import Header from "../components/Header";
import Hero from "../components/Hero";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import { FaStar } from "react-icons/fa";
import "./HomePage.css";
import React, { useState, useEffect } from "react";

const HomePage = () => {
  const [priceRange, setPriceRange] = useState(2000);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Filter products based on selected categories (OR logic) and search term
  const filteredProducts = products.filter(product => {
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    // Fetch Products
    fetch(`${API_BASE_URL}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Failed to fetch products:", err));

    // Fetch Categories
    fetch(`${API_BASE_URL}/categories`)
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(data => {
        console.log("HomePage Categories Fetched:", data);
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          console.error("Categories data is not an array:", data);
        }
      })
      .catch(err => {
        console.error("Failed to fetch categories:", err);
      });
  }, []);

  return (
    <div className="homepage">
      <Header cartCount={3} onSearch={setSearchTerm} />
      <Hero />

      <div className="home-container container">
        {/* Sidebar Filters */}
        <aside className="sidebar">
          <div className="filter-section">
            <h3 className="filter-title">Filters</h3>

            <div className="filter-group">
              <h4>Categories</h4>
              <div className="checkbox-list">
                {categories.length > 0 ? (
                  categories.map(cat => {
                    const name = (cat.name || "").toLowerCase();
                    const getIcon = (catName) => {
                      if (catName.includes("men")) return "👕";
                      if (catName.includes("women")) return "👗";
                      if (catName.includes("kid")) return "👶";
                      if (catName.includes("shoe") || catName.includes("foot")) return "👟";
                      if (catName.includes("watch")) return "⌚";
                      if (catName.includes("sport")) return "⚽";
                      if (catName.includes("sale")) return "🔥";
                      if (catName.includes("bag") || catName.includes("access")) return "👜";
                      return "📦";
                    };
                    return (
                      <label key={cat._id} className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => handleCategoryChange(cat.name)}
                        />
                        <span className="checkmark"></span>
                        <span className="cat-filter-icon">{getIcon(name)}</span>
                        {cat.name}
                      </label>
                    );
                  })
                ) : (
                  <p className="no-cat-text">No categories found</p>
                )}
              </div>
            </div>

            <div className="filter-group">
              <h4>Price Range</h4>
              <div className="price-slider-container">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="price-slider"
                />
                <div className="price-values">
                  <span>₹0</span>
                  <span>₹{priceRange}</span>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <h4>Minimum Rating</h4>
              <div className="rating-filters">
                {[4, 3, 2, 1].map(star => (
                  <div key={star} className="rating-option">
                    <span className="stars">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className={i < star ? "star-filled" : "star-empty"} />
                      ))}
                    </span>
                    <span className="rating-label">{star}+ Stars</span>
                  </div>
                ))}
              </div>
              <button className="filter-btn">All Ratings</button>
            </div>

            <button className="clear-btn" onClick={() => setSelectedCategories([])}>Clear All Filters</button>
          </div>


        </aside>

        {/* Main Content */}
        <main className="main-content">
          <div className="content-header">
            <div>
              <h2>All Products</h2>
              <p className="result-count">{filteredProducts.length} products found</p>
            </div>
            <div className="sort-box">
              <select>
                <option>Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest</option>
              </select>
            </div>
          </div>

          <div className="products-grid">
            {filteredProducts.map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
