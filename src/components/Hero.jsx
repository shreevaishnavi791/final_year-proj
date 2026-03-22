import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Zap, Star } from "lucide-react";
import "./Hero.css";

const Hero = () => {
  const navigate = useNavigate();

  const handleShopNow = () => {
    navigate("/products/wet-grinders");
  };

  return (
    <section className="hero">
      <div className="hero-banner">
        {/* Decorative floating shapes */}
        <div className="hero-bg-shapes">
          <div className="hero-shape hero-shape-1"></div>
          <div className="hero-shape hero-shape-2"></div>
          <div className="hero-shape hero-shape-3"></div>
          <div className="hero-shape hero-shape-4"></div>
        </div>

        <div className="container">
          <div className="hero-two-col">
            {/* Text Side */}
            <div className="hero-content">
              <h1 className="hero-title">
                Premium Wet Grinders
                <span className="hero-title-accent"> for Every Kitchen</span>
              </h1>
              <p className="hero-description">
                Explore high-quality wet grinders designed for smooth grinding, durability and performance. 
                Built with precision engineering for the perfect batter every time.
              </p>
              <button className="hero-btn" onClick={handleShopNow}>
                Shop Now
              </button>
            </div>

            {/* Image Side */}
            <div className="hero-image-container">
              <div className="hero-image-glow"></div>
              
              {/* Floating Badges */}
              <div className="hero-floating-badge top-left">
                <Zap size={14} />
                <span>Quick Grind</span>
              </div>
              <div className="hero-floating-badge bottom-right">
                <ShieldCheck size={14} />
                <span>5YR Warranty</span>
              </div>
              <div className="hero-floating-badge center-right">
                <Star size={14} />
                <span>Top Rated</span>
              </div>

              <img
                src="/images/maroon-grinder.png"
                alt="Premium Wet Grinder"
                className="hero-main-img"
              />
            </div>
          </div>
        </div>

        {/* Wave bottom edge */}
        <div className="hero-wave">
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,40 C320,100 620,0 960,60 C1200,100 1380,30 1440,50 L1440,120 L0,120 Z" fill="white" />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default Hero;
