// OwnerDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./OwnerDashboard.css"; // Ensure your CSS is correctly linked

const OwnerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // For project fetching
  const [isLoadingUser, setIsLoadingUser] = useState(true); // New state for user loading
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAndFetchProjects = async () => {
      setIsLoadingUser(true); // Start loading user
      let userData = null;
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          userData = JSON.parse(storedUser);
          if (!userData || !userData.id) {
            console.error("OwnerDashboard: User ID missing from localStorage data or data malformed.");
            userData = null; // Invalidate userData if ID is missing
          }
        } else {
          console.error("OwnerDashboard: No user found in localStorage.");
        }
      } catch (err) {
        console.error("OwnerDashboard: Session Error (localStorage parse issue):", err.message);
        userData = null;
      } finally {
        setIsLoadingUser(false); // User loading complete
      }

      if (!userData || !userData.id) {
        setError("User not logged in. Please login again.");
        navigate('/login'); // Redirect to login if user data is not valid
        return;
      }

      // If user data is valid, proceed to fetch projects
      try {
        setLoading(true); // Start loading projects
        setError(null); // Clear previous errors
        const response = await axios.get(`http://localhost:5000/api/projects/owner/${userData.id}`);
        setProjects(response.data);
      } catch (err) {
        console.error("Error fetching projects", err);
        setError("Failed to fetch projects. Please try again later.");
      } finally {
        setLoading(false); // Projects loading complete
      }
    };

    checkUserAndFetchProjects();
  }, [navigate]); // Add navigate to dependency array

  if (isLoadingUser) {
    return <div className="loading">Checking user session...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={() => navigate('/login')} className="submit-btn" style={{ maxWidth: '200px', margin: '10px auto' }}>
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading your projects...</div>;
  }

  const approved = projects.filter(p => p.adminStatus === "Approved").length;
  const underReview = projects.filter(p => p.adminStatus === "Under Review").length;
  const rejected = projects.filter(p => p.adminStatus === "Rejected").length;
  const pending = projects.filter(p => p.adminStatus === "Pending").length;
  const completedFunding = projects.filter(p => p.status === "Completed").length;

  const getAdminStatusBadge = (adminStatus) => {
    const statusMap = {
      'Pending': { className: 'admin-status pending', text: '🔍 Waiting for Admin Review' },
      'Under Review': { className: 'admin-status review', text: '👀 Under Admin Review' },
      'Approved': { className: 'admin-status approved', text: '✅ Admin Approved' },
      'Rejected': { className: 'admin-status rejected', text: '❌ Admin Rejected' }
    };
    return statusMap[adminStatus] || statusMap['Pending'];
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">Owner Dashboard</div>
        <div className="nav-links">
          <Link to="/owner/projects">Projects</Link>
          <Link to="/owner/add-project">Add New</Link>
          <Link to="/owner/investments">Investments</Link> 
          <Link to="/owner/contactPage">Contact Us</Link>
          {/* You might want a proper logout function here */}
          <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1rem'}}>Logout</button>
        </div>
      </nav>

      <main className="dashboard-content">
        <h1 className="welcome-text">Welcome Back! 👋</h1>

        {/* Enhanced Stats */}
        <div className="stats-grid">
          <div className="card total">
            <p>Total Projects</p>
            <h2>{projects.length}</h2>
          </div>
          <div className="card pending">
            <p>Pending Admin Review</p>
            <h2>{pending}</h2>
          </div>
          <div className="card review">
            <p>Under Review</p>
            <h2>{underReview}</h2>
          </div>
          <div className="card approved">
            <p>Admin Approved</p>
            <h2>{approved}</h2>
          </div>
          <div className="card rejected">
            <p>Rejected</p>
            <h2>{rejected}</h2>
          </div>
          <div className="card completed"> 
            <p>Funding Completed</p>
            <h2>{completedFunding}</h2>
          </div>
        </div>

        {/* Add Project Button */}
        <div className="add-project-section">
          <Link to="/owner/add-project" className="add-project-btn">
            ➕ Add New Project
          </Link>
        </div>

        {/* Projects List */}
        <h2 className="section-title">Your Projects</h2>
        {projects.length === 0 ? (
          <div className="no-projects">
            <p>You haven't created any projects yet.</p>
            <Link to="/owner/add-project" className="add-first-project-btn">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => {
              const remainingAmount = project.amount - project.amountFunded;
              const fundingPercentage = project.amount > 0 ? (project.amountFunded / project.amount) * 100 : 0;

              return (
                <div key={project._id} className="project-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={getAdminStatusBadge(project.adminStatus).className}>
                      {getAdminStatusBadge(project.adminStatus).text}
                    </span>
                  </div>
                  
                  <p className="project-description">{project.description}</p>
                  
                  <div className="project-details">
                    <p><strong>💰 Total Amount Needed:</strong> ₹{project.amount ? project.amount.toLocaleString() : 'Not specified'}</p>
                    <p><strong>💸 Amount Funded:</strong> ₹{project.amountFunded ? project.amountFunded.toLocaleString() : '0'}</p>
                    <p><strong>⏳ Remaining Amount:</strong> ₹{remainingAmount > 0 ? remainingAmount.toLocaleString() : '0'}</p>
                    <p><strong>📍 Location:</strong> {project.location}</p>
                    <p><strong>📅 Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not specified'}</p>
                    <p><strong>👷 Engineer:</strong> {project.engineer || 'Not assigned'}</p>
                  </div>

                  {/* Funding Progress Bar (Optional, but good for visual) */}
                  <div className="funding-progress-bar-container">
                    <div 
                      className="funding-progress-bar" 
                      style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    ></div>
                    <span className="funding-percentage">{fundingPercentage.toFixed(2)}% Funded</span>
                  </div>

                  <div className="project-footer">
                    <span className={`status ${project.status.toLowerCase().replace(' ', '-')}`}>
                      {project.status}
                    </span>
                    <span className={`priority ${project.priority ? project.priority.toLowerCase() : 'medium'}`}>
                      {project.priority || 'Medium'} Priority
                    </span>
                    {/* Display "Funding Completed" badge if status is completed */}
                    {project.status === 'Completed' && (
                      <span className="funding-completed-badge">
                        ✅ Funding Completed!
                      </span>
                    )}
                  </div>

                  {project.adminStatus === 'Rejected' && project.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>Rejection Reason:</strong> {project.rejectionReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      {/* Add custom styles for the new elements */}
      <style>
        {`
          .funding-progress-bar-container {
            background-color: #e0e0e0;
            border-radius: 10px;
            height: 15px;
            margin: 1rem 0;
            overflow: hidden;
            position: relative;
          }

          .funding-progress-bar {
            background: linear-gradient(to right, #4CAF50, #8BC34A);
            height: 100%;
            border-radius: 10px;
            transition: width 0.5s ease-in-out;
          }

          .funding-percentage {
            position: absolute;
            width: 100%;
            text-align: center;
            line-height: 15px;
            font-size: 0.8rem;
            color: #333;
            font-weight: bold;
          }

          .funding-completed-badge {
            background: #4CAF50;
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            margin-left: auto; /* Push to the right */
            display: inline-block; /* Ensure it takes up minimal space */
          }

          .error-message {
            text-align: center;
            padding: 2rem;
            color: #f44336;
            background-color: #ffebee;
            border: 1px solid #f44336;
            border-radius: 8px;
            margin: 2rem auto;
            max-width: 600px;
          }
        `}
      </style>
    </div>
  );
};

export default OwnerDashboard;
