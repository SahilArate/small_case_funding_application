import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./OwnerDashboard.css";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    queryType: "general",
    message: "",
    phone: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");
  
  try {
    const token = localStorage.getItem('token');
    
    const config = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Only add Authorization header if token exists
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios.post(
      "http://localhost:5000/api/contact", 
      formData,
      config
    );
    
    if (response.status === 201) {
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/owner/dashboard');
      }, 3000);
    }
  } catch (err) {
    console.error("Error submitting contact form", err);
    console.error("Error response:", err.response?.data);
    
    setError(err.response?.data?.message || 
      "Failed to submit your query. Please try again later.");
  } finally {
    setSubmitting(false);
  }
};
const handleChange = (e) => {
  setFormData({
    ...formData,
    [e.target.name]: e.target.value
  });
};

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <div className="logo">Contact Us</div>
        <div className="nav-links">
          <Link to="/owner/dashboard">Dashboard</Link>
          <Link to="/owner/projects">Projects</Link>
          <Link to="/owner/add-project">Add New</Link>
          <Link to="/">Logout</Link>
        </div>
      </nav>

      <main className="dashboard-content">
        <h1 className="welcome-text">We'd Love to Hear From You!</h1>
        
        <div className="card" style={{ maxWidth: "800px", margin: "0 auto" }}>
          {submitSuccess ? (
            <div className="text-center p-5">
              <h2 style={{ color: "#4caf50" }}>Thank You! 🎉</h2>
              <p>Your message has been successfully submitted.</p>
              <p>Our team will get back to you within 24-48 hours.</p>
              <p>You'll be redirected to the dashboard shortly...</p>
            </div>
          ) : (
            <>
              <h2 className="section-title" style={{ color: "#333", textAlign: "center" }}>
                Contact Our Support Team
              </h2>
              
              {error && (
                <div className="rejection-reason" style={{ margin: "1rem 0" }}>
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem"
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
                    Query Type *
                  </label>
                  <select
                    name="queryType"
                    value={formData.queryType}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      backgroundColor: "#fff"
                    }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="project">Project Related</option>
                    <option value="payment">Payment Issue</option>
                    <option value="feedback">Feedback/Suggestion</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#555" }}>
                    Your Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="5"
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "8px",
                      border: "1px solid #ddd",
                      fontSize: "1rem",
                      resize: "vertical"
                    }}
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: "#667eea",
                    color: "#fff",
                    border: "none",
                    padding: "0.8rem 1.5rem",
                    borderRadius: "30px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    cursor: submitting ? "not-allowed" : "pointer",
                    width: "100%",
                    transition: "all 0.3s ease",
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Query"}
                </button>
              </form>
            </>
          )}
        </div>
        
        <div className="card" style={{ maxWidth: "800px", margin: "2rem auto 0", padding: "1.5rem" }}>
          <h2 className="section-title" style={{ color: "#333", textAlign: "center" }}>
            Other Ways to Reach Us
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#667eea" }}>📧 Email</h3>
              <p>sahilarate87@gmail.com</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#667eea" }}>📞 Phone</h3>
              <p>+91 98765 43210</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ color: "#667eea" }}>🏢 Office</h3>
              <p>Village Projects HQ, Bangalore, India - 560001</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactPage;