import API_BASE_URL from '../api';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import './AuthPage.css';

import { useNavigate, Link, useLocation } from "react-router-dom";

import logo from "../assets/logo.png";

const AuthPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const navigate = useNavigate();

    const location = useLocation();
    const adminOnly = location.state?.adminOnly === true;
    const [isLogin, setIsLogin] = useState(location.state?.isLogin !== undefined ? location.state.isLogin : true);
    const [showPassword, setShowPassword] = useState(false);

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
                ease: [0.22, 1, 0.36, 1],
                duration: 0.8
            }
        },
        exit: {
            opacity: 0,
            scale: 0.98,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { ease: [0.22, 1, 0.36, 1], duration: 0.6 }
        }
    };

    const brandingVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { duration: 1.2, ease: "easeOut", staggerChildren: 0.2 }
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!acceptedTerms) {
            setError("Please accept Terms & Privacy Policy");
            return;
        }
        try {
            const res = await fetch(`${API_BASE_URL}/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
            } else {
                setSuccess(data.message);
                setTimeout(() => setIsLogin(true), 2000);
            }
        } catch (err) {
            setError("Server not reachable");
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message);
                return;
            }

            // Admin-only mode: block regular customers
            if (adminOnly && !data.user.isAdmin) {
                setError("This login is for admin only. Customers, please browse freely.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            // Notify CartContext on the same tab to re-fetch cart
            window.dispatchEvent(new Event("storage"));

            if (data.user.isAdmin) {
                navigate("/admin");
            } else {
                const destination = location.state?.fromCheckout ? "/checkout" : "/home";
                navigate(destination);
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        }
    };

    return (
        <div className="auth-container">
            {/* Back to Home Button */}
            <motion.div 
                className="back-home-fixed"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                style={{ position: 'fixed', top: '30px', left: '30px', zIndex: 100 }}
            >
                <Link to="/" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    color: '#fff', 
                    textDecoration: 'none',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '10px 20px',
                    borderRadius: '30px',
                    backdropFilter: 'blur(10px)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    <FaArrowLeft /> Home
                </Link>
            </motion.div>

            <div className="auth-content">
                {/* Left Side: Branding */}
                <motion.div
                    className="auth-branding"
                    initial="hidden"
                    animate="visible"
                    variants={brandingVariants}
                >
                    <motion.div variants={itemVariants} className="branding-group">
                        <img src={logo} alt="VEDAN Logo" className="branding-logo-main" />
                        <h1 className="branding-name-main">VEDAN</h1>
                    </motion.div>

                    <motion.div variants={itemVariants} className="brand-badge" style={{
                        background: 'rgba(255,255,255,0.1)',
                        padding: '6px 16px',
                        borderRadius: '20px',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        letterSpacing: '0.2em',
                        marginBottom: '30px',
                        marginTop: '20px',
                        width: 'fit-content',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        ESTA. 2024
                    </motion.div>

                    <motion.h2 variants={itemVariants} className="brand-headline">
                        Elevate Your <br /> <span className="highlight-text">Lifestyle</span>
                    </motion.h2>

                    <motion.p variants={itemVariants} className="brand-subtext">
                        Discover the essence of premium fashion and timeless style crafted for the modern individual.
                    </motion.p>

                    <motion.div variants={itemVariants} className="brand-stats">
                        <div className="stat-item">
                            <h3>PREMIUM</h3>
                            <p>Quality</p>
                        </div>
                        <div className="stat-item">
                            <h3>EXCLUSIVE</h3>
                            <p>Collections</p>
                        </div>
                        <div className="stat-item">
                            <h3>GLOBAL</h3>
                            <p>Shipping</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Right Side: Form */}
                <div className="auth-form-side">
                    <motion.div 
                        className="auth-form-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="auth-tabs">
                            <button
                                className={`auth-tab ${isLogin ? 'active' : ''}`}
                                onClick={() => setIsLogin(true)}
                            >
                                Login
                            </button>
                            {!adminOnly && (
                                <button
                                    className={`auth-tab ${!isLogin ? 'active' : ''}`}
                                    onClick={() => setIsLogin(false)}
                                >
                                    Sign Up
                                </button>
                            )}
                        </div>

                        <AnimatePresence mode='wait'>
                            {isLogin ? (
                                <motion.div
                                    key="login"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="form-container"
                                >
                                    <motion.div variants={itemVariants}>
                                        <h2>Welcome Back</h2>
                                        <p className="form-subtitle">Enter your credentials to access your account</p>
                                    </motion.div>

                                    <form onSubmit={handleLogin}>
                                        <motion.div variants={itemVariants} className="input-group">
                                            <label>Email Address</label>
                                            <div className="input-wrapper">
                                                <FaEnvelope className="input-icon" />
                                                <input
                                                    type="email"
                                                    placeholder="name@company.com"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="input-group">
                                            <label>Password</label>
                                            <div className="input-wrapper">
                                                <FaLock className="input-icon" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="form-actions">
                                            <label className="remember-me">
                                                <input type="checkbox" />
                                                Remember me
                                            </label>
                                            <a href="/" className="forgot-password">Forgot password?</a>
                                        </motion.div>
                                        
                                        {error && <p className="error-text">{error}</p>}
                                        {success && <p className="success-text">{success}</p>}

                                        <motion.button
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit"
                                            className="submit-btn"
                                        >
                                            Sign In
                                        </motion.button>
                                    </form>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="signup"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="form-container"
                                >
                                    <motion.div variants={itemVariants}>
                                        <h2>Create Account</h2>
                                        <p className="form-subtitle">Join the VEDAN community today</p>
                                    </motion.div>

                                    <form onSubmit={handleSignup}>
                                        <motion.div variants={itemVariants} className="input-group">
                                            <label>Full Name</label>
                                            <div className="input-wrapper">
                                                <FaUser className="input-icon" />
                                                <input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="input-group">
                                            <label>Email Address</label>
                                            <div className="input-wrapper">
                                                <FaEnvelope className="input-icon" />
                                                <input 
                                                    type="email" 
                                                    placeholder="name@company.com" 
                                                    value={email} 
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="input-group">
                                            <label>Password</label>
                                            <div className="input-wrapper">
                                                <FaLock className="input-icon" />
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="••••••••" 
                                                    value={password} 
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="password-toggle"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                >
                                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        <motion.div variants={itemVariants} className="form-actions checkbox-only">
                                            <label className="terms-check">
                                                <input type="checkbox" onChange={(e) => setAcceptedTerms(e.target.checked)}/>
                                                I agree to the <a href="/">Terms</a> and <a href="/">Privacy Policy</a>
                                            </label>
                                        </motion.div>
                                        
                                        {error && <p className="error-text">{error}</p>}
                                        {success && <p className="success-text">{success}</p>}

                                        <motion.button
                                            variants={itemVariants}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            type="submit"
                                            className="submit-btn"
                                        >
                                            Create Account
                                        </motion.button>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;



