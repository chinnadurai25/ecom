import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaShoppingBag, FaStar, FaShieldAlt, FaRocket } from 'react-icons/fa';
import './LandingPage.css';
import logo from "../assets/logo.png";

const LandingPage = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                duration: 0.8
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                ease: [0.22, 1, 0.36, 1],
                duration: 0.8
            }
        }
    };

    return (
        <div className="landing-container">
            {/* Background Decorations */}
            <div className="bg-gradient-circle circle-1"></div>
            <div className="bg-gradient-circle circle-2"></div>

            <nav className="landing-nav">
                <motion.div 
                    className="landing-logo"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <img src={logo} alt="VEDAN Logo" />
                    <span>VEDAN</span>
                </motion.div>
                <div className="nav-actions">
                    <button className="nav-btn login-btn" onClick={() => navigate('/auth', { state: { isLogin: true } })}>Login</button>
                    <button className="nav-btn signup-btn" onClick={() => navigate('/auth', { state: { isLogin: false } })}>Get Started</button>
                </div>
            </nav>

            <main className="landing-hero">
                <motion.div 
                    className="hero-content"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="hero-badge">
                        ✨ Welcome to the Future of Shopping
                    </motion.div>
                    
                    <motion.h1 variants={itemVariants} className="hero-title">
                        Redefining the <br /> 
                        <span className="text-gradient">Modern Lifestyle</span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="hero-description">
                        Step into a world of curated excellence. From premium fashion to timeless essentials, 
                        VEDAN brings you the finest collections crafted for those who demand more.
                    </motion.p>

                    <motion.div variants={itemVariants} className="hero-cta-group">
                        <button 
                            className="cta-primary" 
                            onClick={() => navigate('/auth', { state: { isLogin: false } })}
                        >
                            Create Account <FaRocket className="icon-right" />
                        </button>
                        <button 
                            className="cta-secondary"
                            onClick={() => navigate('/auth', { state: { isLogin: true } })}
                        >
                            Existing Member? Login
                        </button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="hero-features">
                        <div className="feature-item">
                            <FaStar className="feature-icon" />
                            <span>Premium Quality</span>
                        </div>
                        <div className="feature-item">
                            <FaShieldAlt className="feature-icon" />
                            <span>Secure Checkout</span>
                        </div>
                        <div className="feature-item">
                            <FaShoppingBag className="feature-icon" />
                            <span>Exclusive Drops</span>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div 
                    className="hero-image-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <div className="floating-card card-1">
                        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=150&q=80" alt="Winter Collection" className="card-img" />
                        <div className="card-info">
                            <div className="card-dot"></div>
                            <p>New Arrival: Winter Collection</p>
                        </div>
                    </div>
                    <div className="floating-card card-2">
                        <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=150&q=80" alt="Fashion" className="card-img" />
                        <div className="card-info">
                            <div className="card-dot green"></div>
                            <p>Orders processed: 10k+</p>
                        </div>
                    </div>
                    <div className="hero-main-visual">
                        <div className="visual-circle"></div>
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=500&q=80" alt="Fashion Model" className="hero-image-large" />
                    </div>
                </motion.div>
            </main>

            <footer className="landing-footer">
                <p>&copy; 2024 VEDAN. All rights reserved. Crafted for excellence.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
