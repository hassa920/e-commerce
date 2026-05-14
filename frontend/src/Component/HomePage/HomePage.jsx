import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="homepage">
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Welcome to <span className="brand-highlight">QuickCommerce</span>
            </h1>
            <p className="hero-subtitle">
              Your one-stop destination for fast, secure, and reliable online shopping in Pakistan
            </p>
            <p className="hero-description">
              Discover amazing products at unbeatable prices. Shop with confidence using our secure checkout system.
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary" onClick={() => navigate('/signup')}>
                Get Started
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/login')}>
                Sign In
              </button>
            </div>
          </div>
          <div className="hero-image">
            <div className="hero-illustration">
              <div className="illustration-circle"></div>
              <div className="illustration-card card-1">🛍️</div>
              <div className="illustration-card card-2">🚚</div>
              <div className="illustration-card card-3">💳</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Fast Checkout</h3>
              <p>Quick and seamless checkout process with multiple payment options</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Secure Payments</h3>
              <p>Your transactions are protected with bank-grade security</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📦</div>
              <h3>Reliable Delivery</h3>
              <p>Track your orders in real-time with our trusted delivery partners</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing on all products with regular discounts</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Shopping?</h2>
          <p>Join thousands of satisfied customers and experience the future of online shopping</p>
          <div className="cta-buttons">
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>
              Create Account
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/login')}>
              Login
            </button>
          </div>
        </div>
      </section>

      {/* TRUST BADGES */}
      <section className="trust-section">
        <div className="container">
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Secure Checkout</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Fast Delivery</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>24/7 Support</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✓</span>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;