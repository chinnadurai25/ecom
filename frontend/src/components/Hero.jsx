import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import tshirt1 from "../assets/tshirt1.png";
import tshirt2 from "../assets/tshirt2.png";
import tshirt3 from "../assets/tshirt3.png";
import tshirt4 from "../assets/tshirt4.png";
import "./hero.css";

const slides = [
  { id: 1, img: tshirt1, title: "Classic Comfort", subtitle: "Round Neck Series", discount: "Premium Quality" },
  { id: 2, img: tshirt2, title: "Urban Edge", subtitle: "Oversized Fit", discount: "New Collection" },
  { id: 3, img: tshirt3, title: "Signature Style", subtitle: "Polo Essentials", discount: "Timeless Design" },
  { id: 4, img: tshirt4, title: "Daily Minimal", subtitle: "Essential Wear", discount: "Best Sellers" }
];

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="hero-section-wrapper">
      <div className="container hero-container" key={slide.id}>
        <div className="hero-left fade-in">


          <h1>
            Discover Your <br />
            <span className="highlight-text">{slide.title}</span>
          </h1>

          <p className="hero-desc">
            Explore premium products with exclusive deals and fast delivery.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn">
              Shop Now <FaArrowRight />
            </button>

          </div>
        </div>

        <div className="hero-right fade-in">
          <div className="featured-card">
            <img
              src={slide.img}
              alt={slide.title}
              className="featured-img"
            />

            <div className="float-card">
              <div className="float-content">
                <strong>{slide.subtitle}</strong>
                <span>{slide.discount}</span>
              </div>
              <button className="mini-shop-btn">Shop</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
