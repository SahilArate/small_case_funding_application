// Updated OwnerProjects.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./OwnerProjects.css";

const OwnerProjects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicProjects();
  }, []);

  const fetchPublicProjects = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/projects/investor/approved");
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching public projects", err);
      alert("Failed to fetch public projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...projects];
    if (filter !== 'all') {
      filtered = filtered.filter(project => 
        project.status.toLowerCase().replace(' ', '-') === filter
      );
    }
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchLower) ||
        project.description.toLowerCase().includes(searchLower) ||
        project.location.toLowerCase().includes(searchLower) ||
        project.engineer?.toLowerCase().includes(searchLower)
      );
    }
    setFilteredProjects(filtered);
  }, [projects, filter, searchTerm]);

  const handleInvestNow = (projectId) => {
    navigate(`/investor/invest/${projectId}`);
  };

  if (loading) {
    return <div className="loading">Loading public projects...</div>;
  }

  return (
    <div className="projects-container">
      <nav className="navbar">
        <div className="logo">
          <Link to="/">InvestConnect</Link>
        </div>
        <div className="nav-links">
          <Link to="/owner/dashboard">Dashboard</Link>
          <Link to="/owner/projects" className="active">Public Projects</Link>
          <Link to="/owner/add-project">Add Project</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/">Home</Link>
        </div>
      </nav>

      <main className="projects-content">
        <div className="projects-header">
          <h1>Public Investment Projects</h1>
          <Link to="/owner/add-project" className="add-project-btn">
            + Add New Project
          </Link>
        </div>

        <div className="controls">
          <div className="filter-buttons">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Projects</button>
            <button className={filter === 'approved' ? 'active' : ''} onClick={() => setFilter('approved')}>Approved</button>
            <button className={filter === 'in-progress' ? 'active' : ''} onClick={() => setFilter('in-progress')}>In Progress</button>
            <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>Completed</button>
          </div>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        <div className="projects-grid">
          {filteredProjects.map(project => (
            <div key={project._id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
                <span className="admin-status approved">✅ Admin Approved</span>
              </div>
              <p className="project-description">{project.description}</p>
              <div className="project-details">
                <div className="detail-row"><span className="detail-label">Amount:</span> ₹{project.amount.toLocaleString()}</div>
                <div className="detail-row"><span className="detail-label">Location:</span> {project.location}</div>
                <div className="detail-row"><span className="detail-label">Deadline:</span> {new Date(project.deadline).toLocaleDateString()}</div>
                <div className="detail-row"><span className="detail-label">Engineer:</span> {project.engineer || 'Not assigned'}</div>
                <div className="detail-row"><span className="detail-label">Created:</span> {new Date(project.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="project-footer">
                <span className="status approved">Approved</span>
                <span className={`priority ${project.priority.toLowerCase()}`}>{project.priority} Priority</span>
              </div>
              <div className="project-actions">
                <button className="btn-invest" onClick={() => handleInvestNow(project._id)}>💸 Invest Now</button>
                <Link to={`/project/details/${project._id}`} className="btn-view">🔍 View Details</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default OwnerProjects;
