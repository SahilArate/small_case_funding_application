// client/src/pages/Home.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && 
          !event.target.closest('.mobile-menu-btn')) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNavigation = (route) => {
    navigate(route);
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const features = [
    {
      id: 1,
      title: "Investor Benefits",
      description: "Access promising projects and grow your wealth while supporting communities.",
      icon: "/assets/investor_benefits.png",
      color: "linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)",
      hoverColor: "linear-gradient(135deg, #4338CA 0%, #4F46E5 100%)"
    },
    {
      id: 2,
      title: "Project Owner Benefits",
      description: "Get funding for your village projects and bring your ideas to life.",
      icon: "/assets/owner_benefits.png",
      color: "linear-gradient(135deg, #EC4899 0%, #DB2777 100%)",
      hoverColor: "linear-gradient(135deg, #DB2777 0%, #EC4899 100%)"
    },
    {
      id: 3,
      title: "Community Impact",
      description: "See real-time impact metrics of your investments on village communities.",
      icon: "assets/community.png",
      color: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
      hoverColor: "linear-gradient(135deg, #059669 0%, #10B981 100%)"
    }
  ];

  return (
    <div className="home-container">
      {/* Custom Cursor */}
      <div 
        className={`custom-cursor ${isDropdownOpen ? 'active' : ''}`}
        style={{
          left: `${cursorPosition.x}px`,
          top: `${cursorPosition.y}px`,
          transform: `translate(-50%, -50%) scale(${isScrolled ? 0.8 : 1})`
        }}
      ></div>
      
      {/* Animated Background Elements */}
      <div className="bg-blur-circle-1"></div>
      <div className="bg-blur-circle-2"></div>
      <div className="bg-blur-circle-3"></div>
      
      {/* Floating Particles */}
      <div className="particles">
        {[...Array(30)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            transform: `scale(${Math.random() * 0.5 + 0.5})`,
          }}></div>
        ))}
      </div>

      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape triangle"></div>
        <div className="shape circle"></div>
        <div className="shape square"></div>
      </div>

      {/* Improved Header with Mobile Menu */}
      <header className={`home-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo-title" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img
            src="/assets/village-logo.webp"
            alt="Village Logo"
            className="logo-img"
          />
          <h1>Village<span>Fund</span></h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="nav-buttons">
          <div className="dropdown" ref={dropdownRef}>
            <button 
              className="nav-btn"
              onClick={toggleDropdown}
              onMouseEnter={() => setIsDropdownOpen(true)}
            >
              <span className="btn-text">Get Started</span>
              <span className="btn-icon">→</span>
            </button>
            <div className={`dropdown-content ${isDropdownOpen ? 'open' : ''}`}>
              <div className="dropdown-item" onClick={() => handleNavigation('/investor-login')}>
                <span>Investor Login</span>
                <span className="item-icon">↗</span>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigation('/investor-signup')}>
                <span>Investor Signup</span>
                <span className="item-icon">↗</span>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigation('/login')}>
                <span>Project Owner Login</span>
                <span className="item-icon">↗</span>
              </div>
              <div className="dropdown-item" onClick={() => handleNavigation('/user-signup')}>
                <span>Project Owner Signup</span>
                <span className="item-icon">↗</span>
              </div>
            </div>
          </div>
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={toggleMobileMenu}
        >
          <div className="menu-icon">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </button>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`} ref={mobileMenuRef}>
        <div className="mobile-nav-buttons">
          <button 
            className="mobile-nav-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span>Get Started</span>
            <span>{isDropdownOpen ? '−' : '+'}</span>
          </button>
          
          <div className={`mobile-dropdown-content ${isDropdownOpen ? 'open' : ''}`}>
            <div className="mobile-dropdown-item" onClick={() => handleNavigation('/investor-login')}>
              Investor Login
            </div>
            <div className="mobile-dropdown-item" onClick={() => handleNavigation('/investor-signup')}>
              Investor Signup
            </div>
            <div className="mobile-dropdown-item" onClick={() => handleNavigation('/login')}>
              Project Owner Login
            </div>
            <div className="mobile-dropdown-item" onClick={() => handleNavigation('/user-signup')}>
              Project Owner Signup
            </div>
          </div>
          
          <button className="mobile-nav-btn" onClick={() => handleNavigation('/about')}>
            About Us
          </button>
          <button className="mobile-nav-btn" onClick={() => handleNavigation('/contact')}>
            Contact
          </button>
          <button className="mobile-nav-btn" onClick={() => handleNavigation('/faq')}>
            FAQ
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h2>
            <span className="gradient-text">Empowering Rural Dreams</span><br />
            Through <span className="highlight">Smart Investments</span>
          </h2>
          <p className="hero-description">
            Revolutionizing rural development by connecting visionary investors with passionate village entrepreneurs. 
            Every rupee invested creates waves of positive change.
          </p>
          <div className="cta-buttons">
            <button 
              className="cta-btn primary"
              onClick={() => handleNavigation('/investor-signup')}
            >
              <span>Become an Investor</span>
              <div className="hover-effect"></div>
            </button>
            <button 
              className="cta-btn secondary"
              onClick={() => handleNavigation('/user-signup')}
            >
              <span>Submit Your Project</span>
              <div className="hover-effect"></div>
            </button>
          </div>
        </div>
        <div className="hero-img-container">
          <div className="image-wrapper">
            <img
              src="/assets/hero-image.png"
              alt="Village Support"
              className="hero-img"
            />
            <div className="glow-effect"></div>
          </div>
          <div className="floating-card investor-card">
            <div className="card-content">
              <div className="card-icon">💰</div>
              <div className="card-text">
                <div className="card-title">Investors</div>
                <div className="card-value">1,200+</div>
              </div>
            </div>
          </div>
          <div className="floating-card project-card">
            <div className="card-content">
              <div className="card-icon">🏗️</div>
              <div className="card-text">
                <div className="card-title">Projects</div>
                <div className="card-value">150+</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <div className="section-subtitle">Why Choose Us</div>
          <h3>Transforming Rural Economies</h3>
          <p>We provide unique benefits for both investors and project owners</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div 
              key={feature.id}
              className={`feature-card ${activeFeature === feature.id ? 'active' : ''}`}
              style={{ background: feature.color }}
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
            >
              <div className="card-bg"></div>
              <div className="feature-icon">
                <img src={feature.icon} alt={feature.title} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className="hover-effect"></div>
              <div className="shine"></div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h3>Ready to Make an Impact?</h3>
            <p>Join our platform today and be part of the rural transformation</p>
            <div className="cta-buttons">
              <button 
                className="cta-btn primary"
                onClick={() => handleNavigation('/investor-signup')}
              >
                <span>Start Investing</span>
                <div className="hover-effect"></div>
              </button>
              <button 
                className="cta-btn secondary"
                onClick={() => handleNavigation('/user-signup')}
              >
                <span>Submit Project</span>
                <div className="hover-effect"></div>
              </button>
            </div>
          </div>
          <div className="cta-image">
            <img src="/assets/cta-image.png" alt="Join Now" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-logo">
              <img src="/assets/village-logo.webp" alt="Village Logo" />
              <h4>Village<span>Fund</span></h4>
            </div>
            <p className="footer-description">
              Bridging the gap between urban capital and rural innovation for sustainable development.
            </p>
            <div className="social-icons">
              <button className="social-icon"><i className="fab fa-twitter"></i></button>
              <button className="social-icon"><i className="fab fa-linkedin"></i></button>
              <button className="social-icon"><i className="fab fa-instagram"></i></button>
              <button className="social-icon"><i className="fab fa-facebook"></i></button>
            </div>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h5>For Investors</h5>
              <button className="footer-link">How It Works</button>
              <button className="footer-link">Investment Guide</button>
              <button className="footer-link">Success Stories</button>
              <button className="footer-link">FAQ</button>
            </div>
            <div className="link-group">
              <h5>For Project Owners</h5>
              <button className="footer-link">Submission Process</button>
              <button className="footer-link">Funding Criteria</button>
              <button className="footer-link">Resources</button>
              <button className="footer-link">Success Tips</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 VillageFund. All rights reserved.</p>
          <div className="legal-links">
            <button className="legal-link">Privacy Policy</button>
            <button className="legal-link">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;