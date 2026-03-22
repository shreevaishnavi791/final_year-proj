import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Phone,
  ShoppingCart,
  User,
  Menu,
  X,
  Loader2,
  Package,
  LogOut,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { productData } from "../data/products";
import { getCloudinaryUrl } from "../utils/cloudinary";
import logo from "../assets/logo.png";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProductsDropdown, setShowProductsDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);
  const productRef = useRef(null);
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { user, userData, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/register");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const categories = [
    {
      name: "Wet Grinders",
      path: "/products/wet-grinders",
      id: "wet-grinders",
    },
    {
      name: "Mixer Grinders",
      path: "/products/mixer-grinders",
      id: "mixer-grinders",
    },
    { name: "Gas Stoves", path: "/products/gas-stoves", id: "gas-stoves" },
    { name: "Spare Parts", path: "/products/spares", id: "spares" },
  ];

  // Debounced search effect
  useEffect(() => {
    const searchProducts = async () => {
      const query = searchQuery.trim().toLowerCase();

      if (!query) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      setShowDropdown(true);

      try {
        const results = [];

        // 1. Search in local productData
        Object.entries(productData).forEach(([categoryId, products]) => {
          const categoryName =
            categories.find((c) => c.id === categoryId)?.name || categoryId;

          products.forEach((product) => {
            const matchesName = product.name.toLowerCase().includes(query);
            const matchesDesc = product.desc?.toLowerCase().includes(query);
            const matchesCategory = categoryName.toLowerCase().includes(query);

            if (matchesName || matchesDesc || matchesCategory) {
              results.push({
                ...product,
                category: categoryId,
                categoryName: categoryName,
                source: "local",
              });
            }
          });
        });

        // 2. Search in Firestore
        const productsSnapshot = await getDocs(collection(db, "products"));
        productsSnapshot.forEach((doc) => {
          const product = { id: doc.id, ...doc.data() };
          const categoryName =
            categories.find((c) => c.id === product.category)?.name ||
            product.category;

          const matchesName = product.name?.toLowerCase().includes(query);
          const matchesDesc = product.desc?.toLowerCase().includes(query);
          const matchesCategory = categoryName.toLowerCase().includes(query);

          if (matchesName || matchesDesc || matchesCategory) {
            // Check for duplicates
            const isDuplicate = results.some((r) => r.id === product.id);
            if (!isDuplicate) {
              results.push({
                ...product,
                categoryName: categoryName,
                source: "firestore",
              });
            }
          }
        });

        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    // Debounce search by 300ms
    const debounceTimer = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (product) => {
    setShowDropdown(false);
    setSearchQuery("");
    navigate(`/products/${product.category}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    const el = document.getElementById("contact");
    if (el) {
      const header = document.querySelector(".header");
      const headerHeight = header ? header.offsetHeight : 0;
      const top =
        el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16; // small padding
      window.scrollTo({ top, behavior: "smooth" });
      setIsOpen(false);
    } else {
      // If not on home page, go to home and then scroll (approximate)
      navigate("/#contact");
    }
  };

  return (
    <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
      {/* Top Info Bar */}
      <div className="header-info-bar">
        <div className="container header-info-container">
          <span className="info-text">Sparkle by Amirthaa</span>
          <div className="info-actions">
            <button
              onClick={handleContactClick}
              className="info-action-btn"
              aria-label="Contact"
            >
              <Phone size={14} />
              <span>Contact</span>
            </button>
            {user ? (
              <span className="info-user-greeting">
                Welcome, {userData?.name || "User"}
              </span>
            ) : (
              <Link to="/login" className="info-action-btn">
                <User size={14} />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="header-main">
        <div className="container header-main-container">
          {/* Logo */}
          <Link to="/" className="nav-logo-link">
            <div className="nav-logo-box">
              <span className="nav-logo-text">Amirthaa</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className={`nav-links ${isOpen ? "nav-open" : ""}`}>
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>About Us</Link>
            
            <div 
              className="nav-link-dropdown-wrap" 
              ref={productRef}
            >
              <button 
                className={`nav-link nav-link-btn ${showProductsDropdown ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setShowProductsDropdown(!showProductsDropdown);
                }}
              >
                Products
                <ChevronDown size={14} className={`dropdown-arrow ${showProductsDropdown ? 'rotate' : ''}`} />
              </button>
              
              {showProductsDropdown && (
                <div className="nav-products-dropdown">
                  {categories.map((cat) => (
                    <Link 
                      key={cat.id} 
                      to={cat.path} 
                      className="nav-dropdown-item"
                      onClick={() => {
                        setShowProductsDropdown(false);
                        setIsOpen(false);
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleContactClick}
              className="nav-link nav-link-btn"
              aria-label="Contact"
            >
              Contact
            </button>
            <Link to="/cart" className="nav-link" onClick={() => setIsOpen(false)}>
              My Cart
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
            <Link to="/orders" className="nav-link" onClick={() => setIsOpen(false)}>My Orders</Link>
            
            {/* Mobile-only category links */}
            <div className="nav-mobile-categories">
              {categories.map((cat) => (
                <Link key={cat.name} to={cat.path} className="nav-link nav-cat-link" onClick={() => setIsOpen(false)}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right Section: Search + Profile */}
          <div className="nav-right-section">
            {/* Search Bar */}
            <div className="nav-search-container" ref={searchRef}>
              <input
                type="text"
                placeholder="Search..."
                className="nav-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowDropdown(true)}
                onKeyDown={handleKeyDown}
              />
              <Search className="nav-search-icon" size={16} />

              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="search-dropdown">
                  {isSearching && (
                    <div className="search-loading">
                      <Loader2 size={20} className="spinner" />
                      <span>Searching...</span>
                    </div>
                  )}

                  {!isSearching && searchResults.length === 0 && (
                    <div className="no-results">
                      <Search size={24} />
                      <p>No products found</p>
                      <span>
                        Try searching for "grinder", "mixer", or "stove"
                      </span>
                    </div>
                  )}

                  {!isSearching && searchResults.length > 0 && (
                    <div className="search-results">
                      {searchResults.slice(0, 8).map((product) => (
                        <div
                          key={`${product.source}-${product.id}`}
                          className="search-result-item"
                          onClick={() => handleProductClick(product)}
                        >
                          {product.image && (
                            <img
                              src={getCloudinaryUrl(product.image)}
                              alt={product.name}
                              className="result-image"
                            />
                          )}
                          {!product.image && (
                            <div className="result-image-placeholder">
                              <Search size={20} />
                            </div>
                          )}
                          <div className="result-info">
                            <h4>{product.name}</h4>
                            <p className="result-category">
                              {product.categoryName}
                            </p>
                            <p className="result-price">{product.price}</p>
                          </div>
                        </div>
                      ))}
                      {searchResults.length > 8 && (
                        <div className="search-footer">
                          +{searchResults.length - 8} more results
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            {user ? (
              <div 
                className="profile-dropdown-container"
                onMouseEnter={() => setShowProfileDropdown(true)}
                onMouseLeave={() => setShowProfileDropdown(false)}
              >
                <div 
                  className="nav-profile-trigger"
                  onClick={() => navigate("/profile")}
                >
                  <User size={16} />
                  <span>Profile</span>
                </div>
                
                {showProfileDropdown && (
                  <div className="profile-details-dropdown">
                    <div className="dropdown-user-header">
                      <div className="dropdown-avatar">
                        {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                      </div>
                      <div className="dropdown-user-info">
                        <h4>{userData?.name || "User"}</h4>
                        <p>{userData?.email}</p>
                      </div>
                    </div>
                    
                    <div className="dropdown-details">
                      <div className="detail-item">
                        <Phone size={14} />
                        <span>{userData?.phone || "No phone added"}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={14} />
                        <span>{userData?.address || "No address added"}</span>
                      </div>
                    </div>

                    <div className="dropdown-links">
                      <Link to="/profile" onClick={() => setShowProfileDropdown(false)}>
                        <User size={16} /> Update Profile
                      </Link>
                      <Link to="/orders" onClick={() => setShowProfileDropdown(false)}>
                        <Package size={16} /> Order History
                      </Link>
                      <Link to="/cart" onClick={() => setShowProfileDropdown(false)}>
                        <ShoppingCart size={16} /> My Cart
                      </Link>
                    </div>

                    <button onClick={handleLogout} className="dropdown-logout-btn">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-profile-trigger">
                <User size={16} />
                <span>Login</span>
              </Link>
            )}

            <button
              className="mobile-menu-btn"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;