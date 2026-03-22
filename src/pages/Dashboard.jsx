import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { getCloudinaryUrl } from "../utils/cloudinary";
import {
  PackageCheck, Loader2, ArrowRight, Award, Heart, Headphones,
  ShieldCheck, Truck, Clock, Star, ChevronRight, Settings, Wrench, Zap
} from "lucide-react";
import Hero from "../components/Hero";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [allProducts, setAllProducts] = useState([]);
  const [newProductsIdx, setNewProductsIdx] = useState(0);
  const CARDS_PER_VIEW = 4;

  // ── Scroll-reveal animation observer ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("anim-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    const els = document.querySelectorAll(".anim-on-scroll");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Fetch products from Firebase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        // Sort to show latest products first
        products.sort((a, b) => {
          let timeA = 0;
          let timeB = 0;
          if (a.updatedAt && a.updatedAt.seconds) timeA = a.updatedAt.seconds;
          else if (a.createdAt && a.createdAt.seconds) timeA = a.createdAt.seconds;
          else if (typeof a.updatedAt === 'string') timeA = new Date(a.updatedAt).getTime() || 0;
          else if (typeof a.createdAt === 'string') timeA = new Date(a.createdAt).getTime() || 0;

          if (b.updatedAt && b.updatedAt.seconds) timeB = b.updatedAt.seconds;
          else if (b.createdAt && b.createdAt.seconds) timeB = b.createdAt.seconds;
          else if (typeof b.updatedAt === 'string') timeB = new Date(b.updatedAt).getTime() || 0;
          else if (typeof b.createdAt === 'string') timeB = new Date(b.createdAt).getTime() || 0;

          if (timeA === timeB) return b.id.localeCompare(a.id);
          return timeB - timeA;
        });
        
        setAllProducts(products);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Fallback local products if Firebase is empty
  const fallbackProducts = [
    { id: "f1", name: "Wet Grinder Tilt Plus", price: 12900, image: "/images/tilt-plus.png", category: "wet-grinders" },
    { id: "f2", name: "Mixer Grinder Super Mix", price: 15900, image: "/images/amirthaa-supermix.png", category: "mixer-grinders" },
    { id: "f3", name: "Gas Stove 3B Glass", price: 8500, image: "/images/gas-stove-3b-glass.png", category: "gas-stoves" },
    { id: "f4", name: "Wet Grinder Tilt DX", price: 10900, image: "/images/tilt-dx.png", category: "wet-grinders" },
    { id: "f5", name: "Omega Mixer Grinder", price: 6900, image: "/images/omega.png", category: "mixer-grinders" },
    { id: "f6", name: "Gas Stove 4B Glass", price: 11500, image: "/images/gas-stove-4b-glass.png", category: "gas-stoves" },
  ];

  const displayProducts = allProducts.length > 0 ? allProducts : fallbackProducts;
  const newProducts = displayProducts.slice(0, 8);

  const getVisibleProducts = (list, startIdx) =>
    list.slice(startIdx, startIdx + CARDS_PER_VIEW);

  const shopCategories = [
    {
      id: "wet-grinders",
      name: "Table Top Wet Grinders",
      subtitle: "20+ Products",
      image: "/images/amirthaa-classic.png",
    },
    {
      id: "wet-grinders",
      name: "Tilting Wet Grinders",
      subtitle: "20+ Products",
      image: "/images/tilt-plus.png",
    },
    {
      id: "wet-grinders",
      name: "Commercial Wet Grinders",
      subtitle: "20+ Products",
      image: "/images/amirthaa-grind-pro.png",
    },
    {
      id: "wet-grinders",
      name: "Mini Wet Grinders",
      subtitle: "20+ Products",
      image: "/images/amirthaa-prima.png",
    },
  ];

  const featureCards = [
    {
      icon: <Zap size={32} />,
      title: "High Performance Grinding",
      description: "Smooth and efficient grinding for daily use",
    },
    {
      icon: <ShieldCheck size={32} />,
      title: "Durable Build Quality",
      description: "Long-lasting motor and strong materials",
    },
    {
      icon: <Settings size={32} />,
      title: "Easy Maintenance",
      description: "User-friendly design for cleaning and handling",
    },
  ];

  const formatPrice = (price) => {
    if (typeof price === "number") return `${price.toLocaleString("en-IN")} ₹`;
    return price || "—";
  };

  const getProductImage = (product) => {
    if (!product.image) return "/images/tilt-plus.png";
    if (product.image.startsWith("/images/") || product.image.startsWith("http")) return product.image;
    return getCloudinaryUrl(product.image);
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    if (addToCart) addToCart(product);
  };

  return (
    <div className="dashboard-page">
      {/* Hero Banner */}
      <Hero />

      {/* ── Brand Stats Highlights ── */}
      <section className="brand-stats-section anim-on-scroll">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-number">50K+</span>
              <p className="stat-label">Happy Kitchens</p>
              <div className="stat-bar"></div>
            </div>
            <div className="stat-card">
              <span className="stat-number">15+</span>
              <p className="stat-label">Product Awards</p>
              <div className="stat-bar"></div>
            </div>
            <div className="stat-card">
              <span className="stat-number">24/7</span>
              <p className="stat-label">Support Team</p>
              <div className="stat-bar"></div>
            </div>
            <div className="stat-card">
              <span className="stat-number">10Y</span>
              <p className="stat-label">Brand Legacy</p>
              <div className="stat-bar"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlight Cards ── */}
      <section className="features-highlight-section">
        <div className="container">
          <div className="features-white-box">
            <div className="features-highlight-grid">
              {featureCards.map((feat, idx) => (
                <div key={idx} className="feature-highlight-card anim-on-scroll" style={{ transitionDelay: `${idx * 120}ms` }}>
                  <div className="feature-icon-circle">
                    {feat.icon}
                  </div>
                  <h3 className="feature-highlight-title">{feat.title}</h3>
                  <p className="feature-highlight-desc">{feat.description}</p>
                  <button
                    className="feature-explore-btn"
                    onClick={() => navigate("/products/wet-grinders")}
                  >
                    Explore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Shop by Category ── */}
      <section 
        className="category-shop-section"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.3)), url('/images/category-bg-texture.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container">
          <div className="section-center-header anim-on-scroll">
            <h2 className="section-title centered">Shop by Category</h2>
            <p className="section-subtitle">
              Discover our top-water grinders loved by customers for performance and durability.
            </p>
          </div>
          <div className="category-horizontal-grid">
            {shopCategories.map((cat, idx) => (
              <Link
                key={idx}
                to={`/products/${cat.id}`}
                className="category-horizontal-card anim-on-scroll"
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="cat-card-image-wrap">
                  <img src={cat.image} alt={cat.name} className="cat-card-image" />
                  <div className="cat-card-decorative-lines">
                    <div className="dec-line dec-line-1"></div>
                    <div className="dec-line dec-line-2"></div>
                    <div className="dec-line dec-line-3"></div>
                  </div>
                </div>
                <div className="cat-card-info">
                  <h3 className="cat-card-name">{cat.name}</h3>
                  <p className="cat-card-subtitle">{cat.subtitle}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Best Selling Wet Grinders Today ── */}
      <section 
        className="best-selling-section"
        style={{
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), url('/images/category-bg-texture.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container">
          <div className="best-selling-unique-wrapper anim-on-scroll">
            <div className="best-selling-image-side">
              <div className="best-selling-image-card">
                <img
                  src="/images/best-selling-unique.png"
                  alt="Best Selling Wet Grinder"
                  className="best-selling-product-img"
                />
                {/* Floating Badges */}
                <div className="floating-badge badge-1">Eco-Motor</div>
                <div className="floating-badge badge-2">Quiet Tech</div>
                <div className="floating-badge badge-3">Smart Grinding</div>
              </div>
              <div className="best-selling-glow-orb"></div>
              <div className="best-selling-vertical-lines">
                <span className="v-line v-line-red"></span>
                <span className="v-line v-line-blue"></span>
                <span className="v-line v-line-yellow"></span>
                <span className="v-line v-line-purple"></span>
              </div>
            </div>
            <div className="best-selling-text-side">
              <span className="best-selling-tag">Limited Edition</span>
              <h2 className="best-selling-heading">Premium Master Series Grinder</h2>
              <p className="best-selling-desc">
                Experience the next generation of grinding excellence. Our Master Series 
                combines elegant aesthetics with unparalleled engineering. Precision-tuned 
                for consistent textures and whisper-quiet operation.
              </p>
              <div className="best-selling-features">
                <div className="bs-feat-item">
                  <Star size={16} /> <span>Food Grade Material</span>
                </div>
                <div className="bs-feat-item">
                  <PackageCheck size={16} /> <span>Overload Protection</span>
                </div>
              </div>
              <button
                className="best-selling-btn gradient-btn"
                onClick={() => navigate("/products/wet-grinders")}
              >
                Get it Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── New Products ── */}
      <section className="products-section anim-on-scroll">
        <div className="container">
          <div className="section-header">
            <div className="section-header-text">
              <h2 className="section-title">New Products</h2>
              <p className="section-description">Discover our latest kitchen innovations</p>
            </div>
            <div className="section-nav">
              <button
                className="nav-arrow"
                onClick={() => setNewProductsIdx((i) => Math.max(0, i - 1))}
                disabled={newProductsIdx === 0}
              >
                ←
              </button>
              <button
                className="nav-arrow"
                onClick={() => setNewProductsIdx((i) => Math.min(newProducts.length - CARDS_PER_VIEW, i + 1))}
                disabled={newProductsIdx >= newProducts.length - CARDS_PER_VIEW}
              >
                →
              </button>
            </div>
          </div>

          <div className="products-carousel">
            {getVisibleProducts(newProducts, newProductsIdx).map((product, idx) => (
              <Link
                key={product.id}
                to={`/products/${product.category || "wet-grinders"}`}
                className="product-card"
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                <div className="product-badge">New</div>
                <div className="product-image-wrapper">
                  <img src={getProductImage(product)} alt={product.name} className="product-image" />
                </div>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{formatPrice(product.price)}</p>
                <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(e, product)}>
                  <span>Add to Cart</span>
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
