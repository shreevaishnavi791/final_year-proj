import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Phone, Mail, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        {/* Brand & Social Section */}
        <div className="footer-brand-section">
          <h2 className="footer-logo">Amirthaa</h2>
          <p className="footer-desc">
            Pioneer in high quality grinder core blenders and top rated home appliances designed for smooth grinding and durability. 
            Trusted by millions of kitchens across India.
          </p>
          <a href="mailto:support@amirthaa.com" className="footer-email-link">
            support@amirthaa.com
          </a>
        </div>

        {/* Links Grid */}
        <div className="footer-links-grid">
          {/* Quick Links */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links-list">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/products/wet-grinders">Products</Link></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Quick Links (Secondary) */}
          <div className="footer-column">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="footer-links-list">
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-column">
            <h3 className="footer-heading">Categories</h3>
            <ul className="footer-links-list">
              <li><Link to="/products/wet-grinders">Table Top</Link></li>
              <li><Link to="/products/wet-grinders">Tilting</Link></li>
              <li><Link to="/products/wet-grinders">Commercial</Link></li>
              <li><Link to="/products/mixer-grinders">Mixers</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="footer-column" id="contact">
            <h3 className="footer-heading">Customer Support</h3>
            <ul className="footer-links-list">
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Shipping</a></li>
              <li><a href="#">Return Policy</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Social */}
      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>© 2026 Amirthaa, All Rights reserved.</p>
          
          <div className="social-links-bottom">
            <span className="social-follow-text">Follow Amirthaa</span>
            <a href="#" className="social-icon-btn"><Facebook size={18} /></a>
            <a href="#" className="social-icon-btn"><Twitter size={18} /></a>
            <a href="#" className="social-icon-btn"><Instagram size={18} /></a>
            <a href="#" className="social-icon-btn"><Youtube size={18} /></a>
            <a href="#" className="social-icon-btn"><Linkedin size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
