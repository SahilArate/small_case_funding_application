import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './InvestorDashboard.css';

const InvestorDashboard = () => {
  const [approvedProjects, setApprovedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

  const fetchApprovedProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects/investor/approved');
      setApprovedProjects(response.data);
    } catch (error) {
      console.error('Error fetching approved projects:', error);
      alert('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading investment opportunities...</div>;
  }

  return (
    <div className="investor-dashboard-container">
      {/* Investor Navbar */}
      <nav className="investor-navbar">
        <div className="investor-logo">💼 Investor Dashboard</div>
        <div className="investor-nav-links">
          <Link to="/investor/profile">Profile</Link>
          <Link to="/investor/my-investments">My Investments</Link>
          <Link to="/">Logout</Link>
        </div>
      </nav>

      <main className="investor-content">
        <h1 className="investor-welcome">Investment Opportunities 📈</h1>

        <div className="investor-stats">
          <div className="investor-stat-card">
            <p>Available Projects</p>
            <h2>{approvedProjects.length}</h2>
          </div>
        </div>

        {/* Approved Projects for Investment */}
        <div className="investment-projects-section">
          <h2>Projects Ready for Investment</h2>
          {approvedProjects.length === 0 ? (
            <div className="no-projects">
              <p>No approved projects available for investment at this time.</p>
            </div>
          ) : (
            <div className="investment-projects-grid">
              {approvedProjects.map(project => (
                <div key={project._id} className="investment-project-card">
                  <div className="investment-card-header">
                    <span className="approved-badge">✅ Admin Approved</span>
                    <span className={`investment-priority priority-${project.priority.toLowerCase()}`}>
                      {project.priority} Priority
                    </span>
                  </div>

                  <h3>{project.title}</h3>
                  <p className="investment-description">{project.description}</p>

                  <div className="investment-details">
                    <div className="detail-row">
                      <strong>💰 Investment Amount:</strong> ₹{project.amount.toLocaleString()}
                    </div>
                    <div className="detail-row">
                      <strong>📍 Location:</strong> {project.location}
                    </div>
                    <div className="detail-row">
                      <strong>📅 Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                    </div>
                    <div className="detail-row">
                      <strong>👷 Engineer:</strong> {project.engineer || 'To be assigned'}
                    </div>
                  </div>

                  {project.document && (
                    <div className="project-document">
                      <a 
                        href={`http://localhost:5000/${project.document}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        📎 View Project Documents
                      </a>
                    </div>
                  )}

                  <div className="investment-actions">
                    <Link to={`/investor/invest/${project._id}`} className="invest-btn">💳 Invest Now</Link>
                    <button className="details-btn">
                      📋 View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default InvestorDashboard;