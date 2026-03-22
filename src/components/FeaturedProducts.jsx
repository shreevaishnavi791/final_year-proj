import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./FeaturedProducts.css";

const FeaturedProducts = ({ items = [] }) => {
  const { addToCart } = useCart();
  // fallback sample items if none passed
  const sample = items.length
    ? items
    : [
        {
          id: "mix-1",
          name: "Amirthaa SuperMix 1000",
          price: "₹7,499",
          image: "/images/amirthaa-supermix-white.png",
          category: "mixer-grinders",
        },
        {
          id: "grind-1",
          name: "Amirthaa Tilt Plus Grinder",
          price: "₹9,999",
          image: "/images/tilt-plus.png",
          category: "wet-grinders",
        },
        {
          id: "stove-1",
          name: "Amirthaa Glass Top Stove",
          price: "₹5,299",
          image: "/images/gas-stove-3b-glass.png",
          category: "gas-stoves",
        },
      ];

  return (
    <section className="featured-section">
      <div className="container">
        <div className="featured-header">
          <h2>Featured Products</h2>
          <p className="muted">
            Handpicked appliances for performance and style
          </p>
        </div>

        <div className="featured-grid">
          {sample.map((product, idx) => (
            <div
              key={product.id}
              className="featured-card-premium anim-on-scroll product-card-shimmer"
              style={{ transitionDelay: `${(idx % 3) * 100}ms` }}
            >
              <Link to={`/product/${product.id}`} className="fp-image-wrap-premium">
                <div className="fp-bg-circle"></div>
                <img
                  src={product.image}
                  alt={product.name}
                  className="fp-image-premium"
                />
              </Link>
              
              <div className="fp-body-premium">
                <Link to={`/product/${product.id}`} className="fp-name-link">
                  <h4 className="fp-name-premium">{product.name}</h4>
                </Link>
                
                <div className="fp-price-row">
                  <span className="fp-price-premium">{product.price}</span>
                  <span className="fp-badge-sale">Sale</span>
                </div>

                <div className="fp-meta-premium">
                  <div className="fp-tag-delivery">
                    Free Delivery
                  </div>
                  <div className="fp-rating-badge">
                    4.2 ★
                  </div>
                </div>

                <button 
                  className="fp-add-to-cart-btn"
                  onClick={() => addToCart(product)}
                >
                  ADD TO CART
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
