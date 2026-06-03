import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaInstagram, FaEnvelope, FaPhoneAlt, 
    FaMapMarkerAlt, FaPaperPlane, FaFacebookF, 
    FaTwitter, FaYoutube, FaChevronUp,
    FaTruck, FaShieldAlt, FaSyncAlt, FaAward,
    FaCcVisa, FaCcMastercard, FaCcApplePay, FaPaypal
} from 'react-icons/fa';
import { SiGooglepay } from 'react-icons/si';
import logo from '../assets/logo.png';
import './Footer.css';

const Footer = () => {
    const [showBackToTop, setShowBackToTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowBackToTop(true);
            } else {
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="vedan-footer">
            {/* 1. Scrolling Marquee */}
            <div className="footer-marquee">
                <div className="marquee-content">
                    <span>PREMIUM COMFORT • CRAFTED IN TIRUPUR • TIMELESS STYLE • VEDAN CLOTHING • PREMIUM COMFORT • CRAFTED IN TIRUPUR • TIMELESS STYLE • VEDAN CLOTHING • </span>
                    <span>PREMIUM COMFORT • CRAFTED IN TIRUPUR • TIMELESS STYLE • VEDAN CLOTHING • PREMIUM COMFORT • CRAFTED IN TIRUPUR • TIMELESS STYLE • VEDAN CLOTHING • </span>
                </div>
            </div>


            {/* Background Branding Watermark */}
            <div className="footer-watermark">VEDAN</div>

            <div className="footer-container">
                <div className="footer-grid">
                    {/* Brand Section */}
                    <div className="footer-section brand-column">
                        <div className="footer-logo-group">
                            <img src={logo} alt="VEDAN Logo" className="footer-logo-main" />
                            <span className="footer-brand-title">VEDAN</span>
                        </div>
                        <p className="brand-mission">
                            Elevating everyday essentials with premium comfort and timeless style, deeply rooted in the textile heritage of Tirupur.
                        </p>
                        <div className="social-links-grid">
                            <a href="https://instagram.com/vedan_clothing_" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                                <FaInstagram />
                            </a>
                            <a href="#" className="social-icon facebook"><FaFacebookF /></a>
                            <a href="#" className="social-icon twitter"><FaTwitter /></a>
                            <a href="#" className="social-icon youtube"><FaYoutube /></a>
                        </div>
                    </div>

                    {/* Shop Section */}
                    <div className="footer-section links-column">
                        <h4 className="footer-heading">Collections</h4>
                        <ul className="footer-list">
                            <li><Link to="/category/Round Neck">Round Neck T-shirts</Link></li>
                            <li><Link to="/category/Oversized">Oversized T-shirts</Link></li>
                            <li><Link to="/category/Polo">Polo T-shirts</Link></li>
                            <li><Link to="/home">New Arrivals</Link></li>
                            <li><Link to="/home">Best Sellers</Link></li>
                        </ul>
                    </div>

                    {/* Support Section */}
                    <div className="footer-section links-column">
                        <h4 className="footer-heading">Support</h4>
                        <ul className="footer-list">
                            <li><Link to="/orders">My Orders</Link></li>
                            <li><Link to="/wishlist">Wishlist</Link></li>
                            <li><Link to="/profile">Account Settings</Link></li>
                            <li><Link to="/customer-service">Contact Us</Link></li>
                            <li><Link to="/customer-service">Returns & Privacy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter Section */}
                    <div className="footer-section newsletter-column">
                        <h4 className="footer-heading">Join the Circle</h4>
                        <p className="newsletter-text">Subscribe for exclusive drops and early access.</p>
                        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="input-field-group">
                                <input type="email" placeholder="Email Address" required />
                                <button type="submit" className="subscribe-btn">
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </form>
                        <div className="footer-contact-info">
                            <a href="tel:+918248518238" className="contact-tile">
                                <FaPhoneAlt />
                                <span>+91 82485 18238</span>
                            </a>
                            <a href="mailto:kganesh420kumar@gmail.com" className="contact-tile">
                                <FaEnvelope />
                                <span>kganesh420kumar@gmail.com</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-divider"></div>

                <div className="footer-bottom">
                    <div className="footer-legal">
                        <p>&copy; {new Date().getFullYear()} VEDAN Clothing. All rights reserved.</p>
                        <div className="legal-links">
                            <Link to="/customer-service">Privacy</Link>
                            <Link to="/customer-service">Terms</Link>
                            <Link to="/customer-service">Cookies</Link>
                        </div>
                    </div>
                    
                    <div className="payment-methods">
                        <FaCcVisa title="Visa" />
                        <FaCcMastercard title="Mastercard" />
                        <SiGooglepay title="Google Pay" />
                        <FaCcApplePay title="Apple Pay" />
                        <FaPaypal title="PayPal" />
                    </div>
                </div>

                <div className="footer-address">
                    <FaMapMarkerAlt />
                    <span>Cotton Mill Road, Pappa Nagar, Near Balamurugan Mess, Tirupur 641 603</span>
                </div>
            </div>

            {/* Back to Top Button */}
            <button 
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`} 
                onClick={scrollToTop}
                aria-label="Back to top"
            >
                <FaChevronUp />
            </button>
        </footer>
    );
};

export default Footer;

