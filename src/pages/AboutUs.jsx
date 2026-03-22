import React from 'react';
import { Target, Users, Zap, ShieldCheck, Heart, Award } from 'lucide-react';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero anim-on-scroll">
        <div className="about-hero-overlay"></div>
        <div className="container">
          <div className="about-hero-content">
            <span className="brand-tag anim-on-scroll">SINCE 1978</span>
            <h1 className="anim-on-scroll gradient-text">The Amirthaa Legacy</h1>
            <p className="hero-tagline anim-on-scroll" style={{ transitionDelay: '200ms' }}>
              Innovation in Home Appliances for over 45 Years
            </p>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <div className="mouse"></div>
        </div>
      </section>

      {/* Main Content */}
      <section className="about-content-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-main-text anim-on-scroll">
              <h2 className="section-title anim-on-scroll">Our Story</h2>
              <p className="anim-on-scroll" style={{ transitionDelay: '100ms' }}>
                Welcome to Amirthaa, a leading home appliance brand. 
                We are pioneers in the field of kitchen appliances, specializing in high-quality 
                Mixer Grinders, Wet Grinders, and Gas Stoves. Our journey began with a 
                vision to simplify cooking through engineering excellence and consumer-centric innovation.
              </p>
              <p className="anim-on-scroll" style={{ transitionDelay: '200ms' }}>
                Today, Amirthaa is a household name trusted for its reliability, durability, 
                and award-winning designs. Our products are crafted with precision to meet the 
                demanding needs of the modern Indian kitchen.
              </p>
              
              <div className="vision-mission-grid">
                <div className="vision-card premium-glass anim-on-scroll" style={{ transitionDelay: '300ms' }}>
                  <div className="card-icon"><Target size={32} /></div>
                  <h3>Our Vision</h3>
                  <p>To be the world's most trusted partner for premium, innovative, and sustainable kitchen solutions.</p>
                </div>
                <div className="mission-card premium-glass anim-on-scroll" style={{ transitionDelay: '400ms' }}>
                  <div className="card-icon"><Users size={32} /></div>
                  <h3>Our Mission</h3>
                  <p>To empower households through high-performance appliances that combine traditional durability with modern smart technology.</p>
                </div>
              </div>
            </div>

            <div className="about-stats-container anim-on-scroll" style={{ transitionDelay: '500ms' }}>
              <div className="about-stats premium-glass">
                <div className="stat-item">
                  <span className="stat-number gradient-text">45+</span>
                  <span className="stat-label">Years of Excellence</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number gradient-text">15M+</span>
                  <span className="stat-label">Happy Kitchens</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number gradient-text">400+</span>
                  <span className="stat-label">Service Centers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-values">
        <div className="container">
          <h2 className="section-title centered anim-on-scroll">Our Core Values</h2>
          <div className="features-grid">
            <div className="feature-item anim-on-scroll product-card-shimmer" style={{ transitionDelay: '100ms' }}>
              <div className="feature-icon"><Award size={32} /></div>
              <h3>Premium Quality</h3>
              <p>We use only the highest grade materials to ensure long-lasting performance and safety.</p>
            </div>
            <div className="feature-item anim-on-scroll product-card-shimmer" style={{ transitionDelay: '200ms' }}>
              <div className="feature-icon"><Zap size={32} /></div>
              <h3>Innovation</h3>
              <p>State-of-the-art engineering designed for maximum efficiency and ease of use.</p>
            </div>
            <div className="feature-item anim-on-scroll product-card-shimmer" style={{ transitionDelay: '300ms' }}>
              <div className="feature-icon"><Heart size={32} /></div>
              <h3>Consumer Trust</h3>
              <p>Everything we do is centered around creating the best experience for our customers.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
