import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { productData } from "../data/products";
import Card from "../components/Card";
import Button from "../components/Button";
import {
  ChevronRight,
  Loader2,
  ChevronDown,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import { getCloudinaryUrl } from "../utils/cloudinary";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import "./ProductCategory.css";

const ProductCategory = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  // ... rest of state code (omitted for brevity during replace, but tool handles this by keeping unchanged lines if range is correct)
  const [products, setProducts] = useState([]); // Displayed products
  const [rawProducts, setRawProducts] = useState([]); // Original fetched products
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState("Relevance");

  // Filter State
  const [filters, setFilters] = useState({
    color: [],
    price: [],
    rating: [],
    capacity: [],
    warranty: [],
  });

  // Map display names to data keys
  const categoryMap = {
    "Wet Grinders": "wet-grinders",
    "Mixer Grinders": "mixer-grinders",
    "Gas Stoves": "gas-stoves",
    Spares: "spares",
    "Table Top Grinders": "table-top-grinders",
    "Commercial Grinders": "commercial-grinders",
    "Atta Kneaders": "atta-kneaders",
  };

  const [activeCategories, setActiveCategories] = useState([]);

  useEffect(() => {
    setActiveCategories([categoryId]);
    setFilters({
      color: [],
      price: [],
      rating: [],
      capacity: [],
      warranty: [],
    });
  }, [categoryId]);

  // Handle Scroll Animations for dynamic products
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("anim-visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    const elements = document.querySelectorAll(".anim-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [products]); // Re-run when products update to observe new cards

  const handleCategoryToggle = (categoryName) => {
    const key = categoryMap[categoryName];
    setActiveCategories((prev) => {
      if (prev.includes(key)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  const handleFilterChange = (type, value) => {
    setFilters((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // 1. Fetch Data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let allFetched = [];

        for (const catId of activeCategories) {
          if (!catId) continue;

          // Local
          const localProducts = productData[catId] || [];

          // Firestore
          const q = query(
            collection(db, "products"),
            where("category", "==", catId),
          );
          const querySnapshot = await getDocs(q);
          const firestoreProducts = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            firestoreProducts.push({ id: doc.id, ...data, local: false });
          });

          allFetched = [...allFetched, ...firestoreProducts, ...localProducts];
        }

        const uniqueProducts = Array.from(
          new Map(allFetched.map((item) => [item.id, item])).values(),
        );
        setRawProducts(uniqueProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setRawProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (activeCategories.length > 0) {
      fetchProducts();
    } else {
      setRawProducts([]);
      setLoading(false);
    }
  }, [activeCategories]);

  // 2. Apply Filters & Sort
  useEffect(() => {
    let result = [...rawProducts];

    // --- Filtering ---

    // Color
    if (filters.color.length > 0) {
      result = result.filter((p) =>
        filters.color.some(
          (c) => p.color && p.color.toLowerCase() === c.toLowerCase(),
        ),
      );
    }

    // Price
    if (filters.price.length > 0) {
      result = result.filter((p) => {
        const priceVal = parseInt(
          p.price.toString().replace(/[^0-9]/g, "") || 0,
        );
        return filters.price.some((range) => {
          if (range === "Under ₹2000") return priceVal < 2000;
          if (range === "₹2000 - ₹5000")
            return priceVal >= 2000 && priceVal <= 5000;
          if (range === "₹5000 - ₹10000")
            return priceVal > 5000 && priceVal <= 10000;
          if (range === "Over ₹10000") return priceVal > 10000;
          return false;
        });
      });
    }

    // Rating
    if (filters.rating.length > 0) {
      result = result.filter((p) => {
        const ratingVal = parseFloat(p.rating || 0);
        return filters.rating.some((r) => {
          if (r === "4.0 ★ & above") return ratingVal >= 4.0;
          if (r === "3.0 ★ & above") return ratingVal >= 3.0;
          if (r === "2.0 ★ & above") return ratingVal >= 2.0;
          return false;
        });
      });
    }

    // Capacity / Power (checking both fields as they are generic specs)
    if (filters.capacity.length > 0) {
      result = result.filter((p) => {
        const specs = [p.capacity, p.power, p.size].map((s) =>
          s?.toLowerCase(),
        );
        return filters.capacity.some((c) =>
          specs.some((s) => s && s.includes(c.toLowerCase())),
        );
      });
    }

    // Warranty
    if (filters.warranty.length > 0) {
      result = result.filter((p) => {
        return filters.warranty.some(
          (w) =>
            p.warranty && p.warranty.toLowerCase().includes(w.toLowerCase()),
        );
      });
    }

    // --- Sorting ---
    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => {
          const pA = parseInt(a.price.toString().replace(/[^0-9]/g, "") || 0);
          const pB = parseInt(b.price.toString().replace(/[^0-9]/g, "") || 0);
          return pA - pB;
        });
        break;
      case "Price: High to Low":
        result.sort((a, b) => {
          const pA = parseInt(a.price.toString().replace(/[^0-9]/g, "") || 0);
          const pB = parseInt(b.price.toString().replace(/[^0-9]/g, "") || 0);
          return pB - pA;
        });
        break;
      case "Rating":
        result.sort(
          (a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0),
        );
        break;
      case "New Arrivals":
        result.reverse();
        break;
      default:
        break;
    }

    setProducts(result);
  }, [rawProducts, filters, sortBy]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Helper to format category title
  const categoryTitle = categoryId
    ? categoryId
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Products";

  if (loading) {
    return (
      <div className="product-category-page container loading-container">
        <Loader2 size={40} className="animate-spin" />
        <p>Discovering products...</p>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="product-category-page container">
        <h1>Category Not Found</h1>
        <Link to="/" className="text-primary">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="product-category-page">
      <div className="container">


        {/* Breadcrumb */}
        <div className="breadcrumb">
          <Link to="/" className="breadcrumb-item">
            <span className="home-icon">🏠</span>
          </Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-item">Products</span>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{categoryTitle}</span>
        </div>

        <div className="product-page-layout">
          {/* Sidebar Filters */}
          <aside className="product-sidebar anim-on-scroll">
            <div className="sidebar-header">
              <h3>Filters</h3>
              <span className="filter-count">50+ Products</span>
            </div>

            <div className="filter-section">
              <div className="filter-group">
                <h4 className="filter-title">Category</h4>
                <div className="checkbox-group">
                  {[
                    "Wet Grinders",
                    "Mixer Grinders",
                    "Gas Stoves",
                    "Spares",
                    "Table Top Grinders",
                    "Commercial Grinders",
                    "Atta Kneaders",
                  ].map((item, i) => (
                    <label key={i} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={activeCategories.includes(categoryMap[item])}
                        onChange={() => handleCategoryToggle(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {[
                {
                  title: "Color",
                  type: "color",
                  options: [
                    "purple",
                    "Lavender",
                    "Red",
                    "Cherry red",
                    "Blue",
                    "Green",
                    "Orange",
                  ],
                },
                {
                  title: "Price",
                  type: "price",
                  options: [
                    "Under ₹2000",
                    "₹2000 - ₹5000",
                    "₹5000 - ₹10000",
                    "Over ₹10000",
                  ],
                },
                {
                  title: "Rating",
                  type: "rating",
                  options: ["4.0 ★ & above", "3.0 ★ & above", "2.0 ★ & above"],
                },
                {
                  title: "Capacity / Power",
                  type: "capacity",
                  options: [
                    "2 Litres",
                    "3 Litres",
                    "500 Watts",
                    "750 Watts",
                    "1 HP",
                  ],
                },
                {
                  title: "Warranty",
                  type: "warranty",
                  options: ["1 Year", "2 Years", "5 Years", "10 Years (Motor)"],
                },
              ].map((section, idx) => (
                <details key={idx} className="filter-accordion" open>
                  <summary className="accordion-summary">
                    {section.title}
                    <ChevronDown size={16} className="accordion-icon" />
                  </summary>
                  <div className="accordion-content">
                    {section.options.map((opt, i) => (
                      <label key={i} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={filters[section.type]?.includes(opt)}
                          onChange={() => handleFilterChange(section.type, opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </aside>

          {/* Main Content */}
          <main className="product-main">
            <header className="product-header">
              <div className="product-header-left">
                <h1 className="category-title-main">{categoryTitle}</h1>
                <p className="product-count-sub">
                  Showing {products.length} results
                </p>
              </div>

              <div className="sort-dropdown-container">
                <span className="sort-label">Sort by:</span>
                <div className="custom-select">
                  <select value={sortBy} onChange={handleSortChange}>
                    <option value="Relevance">Relevance</option>
                    <option value="Price: Low to High">
                      Price: Low to High
                    </option>
                    <option value="Price: High to Low">
                      Price: High to Low
                    </option>
                    <option value="New Arrivals">New Arrivals</option>
                    <option value="Rating">Rating</option>
                  </select>
                  <ChevronDown size={14} className="select-icon" />
                </div>
              </div>
            </header>

            <div className="product-grid">
              {products.map((product, idx) => (
                <div
                  key={product.id}
                  className="product-card-premium anim-on-scroll product-card-shimmer"
                  style={{ transitionDelay: `${(idx % 4) * 80}ms` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="product-image-container-premium">
                    <div className="product-image-bg-circle"></div>
                    <img
                      src={getCloudinaryUrl(product.image)}
                      alt={product.name}
                      className="product-image-premium"
                    />
                  </div>

                  <div className="product-details-premium">
                    <h3 className="product-name-premium">{product.name}</h3>
                    
                    <div className="product-price-row">
                      <span className="product-price-premium">{product.price}</span>
                      <span className="product-badge-sale">Sale</span>
                    </div>

                    <div className="product-meta-premium">
                      <div className="product-tag-delivery">
                        Free <br /> Delivery
                      </div>
                      <div className="product-rating-badge">
                        {product.rating || 
                          (3.0 + (product.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 21) / 10).toFixed(1)
                        } <Star size={12} fill="currentColor" />
                      </div>
                    </div>

                    <button
                      className="product-add-to-cart-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                      }}
                    >
                      ADD TO CART
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductCategory;
