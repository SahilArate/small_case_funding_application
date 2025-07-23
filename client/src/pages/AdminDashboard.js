import React, { useState, useEffect, useCallback } from 'react'; 
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const showMessageModal = (msg) => {
    setMessage(msg);
    setIsMessageModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessage('');
  };

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/projects/admin/all', {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      console.log('Projects fetched successfully:', response.data);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (error.code === 'ECONNABORTED') {
        setError('Request timeout - Server might be down');
      } else if (error.response) {
        if (error.response.status === 401) {
          showMessageModal('Session expired or unauthorized. Please login again.');
          navigate('/admin/login');
        } else {
          setError(`Server Error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
        }
      } else if (error.request) {
        setError('Network Error - Cannot connect to server. Make sure the server is running on port 5000');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); 

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectAction = async (projectId, action, rejectionReason = '') => {
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`http://localhost:5000/api/projects/admin/${projectId}`, {
        action,
        rejectionReason
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        showMessageModal(`Project ${action} successfully!`);
        fetchProjects(); 
      }
    } catch (error) {
      console.error('Error updating project:', error);
      showMessageModal(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleApprove = (projectId) => {
  
    handleProjectAction(projectId, 'approve');
  };

  const handleReject = (projectId) => {
    const reason = prompt('Please enter the rejection reason:');
    if (reason && reason.trim()) {
      handleProjectAction(projectId, 'reject', reason.trim());
    } else if (reason !== null) {
      showMessageModal('Rejection reason cannot be empty.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true;
    return project.adminStatus === filter;
  });

  const stats = {
    total: projects.length,
    pending: projects.filter(p => p.adminStatus === 'Pending').length,
    underReview: projects.filter(p => p.adminStatus === 'Under Review').length,
    approved: projects.filter(p => p.adminStatus === 'Approved').length,
    rejected: projects.filter(p => p.adminStatus === 'Rejected').length
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <nav className="admin-navbar">
          <div className="admin-logo">🛡️ Admin Panel</div>
          <div className="admin-nav-links">
            <span>Welcome, Admin</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </nav>
        <div className="admin-content">
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            color: '#e74c3c'
          }}>
            <h2>❌ Error Loading Projects</h2>
            <p>{error}</p>
            <button
              onClick={fetchProjects}
              style={{
                background: '#3742fa',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '25px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          .admin-dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%); /* Deeper purple gradient */
            font-family: 'Inter', sans-serif;
            color: #f0f0f0;
          }

          /* Admin Navbar */
          .admin-navbar {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            position: sticky;
            top: 0;
            z-index: 1000;
          }

          .admin-logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4a5568;
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .admin-nav-links {
            display: flex;
            gap: 1.5rem;
            align-items: center;
          }

          .admin-nav-links span {
            color: #4a5568;
            font-weight: 500;
          }

          .admin-nav-links button {
            background: none;
            border: none;
            color: #4a5568;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            cursor: pointer;
          }

          .admin-nav-links button:hover {
            background: rgba(142, 45, 226, 0.1);
            color: #8e2de2;
            transform: translateY(-2px);
          }

          .logout-btn {
            color: #e53e3e !important;
            border: 1px solid #e53e3e !important;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
          }

          .logout-btn:hover {
            background: #e53e3e !important;
            color: white !important;
            transform: translateY(-2px);
          }

          /* Main Content */
          .admin-content {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
          }

          .admin-welcome {
            text-align: center;
            color: white;
            font-size: 2.8rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            font-weight: 700;
          }

          /* Tab Buttons for Navigation */
          .tab-btn-container {
              display: flex;
              justify-content: center;
              margin-bottom: 2.5rem;
              gap: 1.5rem;
          }

          .tab-btn {
              background: rgba(255, 255, 255, 0.2);
              border: 1px solid rgba(255, 255, 255, 0.4);
              color: white;
              padding: 0.8rem 2rem;
              border-radius: 12px;
              font-weight: 600;
              font-size: 1.1rem;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          }

          .tab-btn:hover {
              background: rgba(255, 255, 255, 0.3);
              transform: translateY(-3px);
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
          }

          .tab-btn.active {
              background: white;
              color: #8e2de2;
              box-shadow: 0 6px 20px rgba(142, 45, 226, 0.4);
          }


          /* Admin Stats Grid */
          .admin-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
          }

          .admin-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1.5rem;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
          }

          .admin-card:hover {
            transform: translateY(-5px);
          }

          .admin-card p {
            color: #718096;
            font-size: 1rem;
            margin-bottom: 0.5rem;
          }

          .admin-card h2 {
            font-size: 2.2rem;
            margin: 0;
            font-weight: 700;
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* Filter Buttons */
          .filter-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2.5rem;
            flex-wrap: wrap;
          }

          .filter-buttons button {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 0.75rem 1.5rem;
            border-radius: 10px;
            font-weight: 600;
            color: #4a5568;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
          }

          .filter-buttons button:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          .filter-buttons button.active {
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            color: white;
            box-shadow: 0 4px 15px rgba(142, 45, 226, 0.3);
            transform: translateY(-2px);
          }

          /* Projects List Section */
          .admin-projects-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .admin-projects-section h2 {
            color: #2d3748;
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
            font-weight: 700;
          }

          .admin-projects-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 2rem;
          }

          /* Project Card */
          .admin-project-card {
            background: linear-gradient(145deg, #ffffff, #f7fafc);
            border-radius: 16px;
            padding: 1.8rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }

          .admin-project-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(45deg, #4a00e0, #8e2de2); /* Purple gradient top border */
          }

          .admin-project-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          }

          .project-status-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .admin-status-badge {
            color: white;
            padding: 0.4rem 0.9rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .admin-status-badge.approved { background-color: #48bb78; }
          .admin-status-badge.pending { background-color: #ed8936; }
          .admin-status-badge.rejected { background-color: #f56565; }
          .admin-status-badge.under-review { background-color: #4299e1; }


          .project-date {
            font-size: 0.9rem;
            color: #718096;
          }

          .project-title {
            color: #2d3748;
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: 700;
          }

          .project-desc {
            color: #4a5568;
            font-size: 1rem;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .project-info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.8rem;
            margin-bottom: 1.2rem;
            padding-bottom: 1.2rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .info-item {
            font-size: 0.95rem;
            color: #4a5568;
          }

          .info-item strong {
            color: #2d3748;
          }

          .document-info {
            background: #edf2f7;
            padding: 0.8rem;
            border-radius: 10px;
            border-left: 4px solid #4a00e0;
            margin-bottom: 1.5rem;
            font-size: 0.9rem;
          }

          .document-link {
            color: #4a00e0;
            text-decoration: none;
            font-weight: 600;
            margin-left: 0.5rem;
          }

          .document-link:hover {
            text-decoration: underline;
          }

          .rejection-reason {
            background: #fed7d7;
            color: #e53e3e;
            padding: 0.8rem;
            border-radius: 10px;
            border-left: 4px solid #e53e3e;
            font-size: 0.9rem;
            margin-top: 1rem;
          }

          /* Admin Action Buttons */
          .admin-actions {
            display: flex;
            gap: 0.8rem;
            margin-top: auto;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
          }

          .approve-btn, .reject-btn {
            flex: 1;
            padding: 0.75rem 1.2rem;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .approve-btn {
            background: linear-gradient(45deg, #48bb78, #38a169);
            color: white;
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
          }

          .approve-btn:hover {
            background: linear-gradient(45deg, #38a169, #2f855a);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
          }

          .reject-btn {
            background: linear-gradient(45deg, #f56565, #e53e3e);
            color: white;
            box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
          }

          .reject-btn:hover {
            background: linear-gradient(45deg, #e53e3e, #c53030);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
          }

          /* No Projects State */
          .no-projects {
            text-align: center;
            padding: 3rem;
            color: #718096;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .no-projects p {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }

          /* Loading State */
          .loading-screen, .error-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            color: white;
            background: linear-gradient(135deg, #4a00e0 0%, #8e2de2 100%);
            text-align: center;
          }

          .spinner {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-top: 4px solid #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin-bottom: 1rem;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          /* Custom Message Modal */
          .message-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
          }

          .message-modal-content {
            background: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            text-align: center;
            max-width: 400px;
            width: 90%;
            transform: scale(0.9);
            animation: modalPopIn 0.3s forwards;
          }

          @keyframes modalPopIn {
            from { transform: scale(0.7); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }

          .message-modal-content h4 {
            color: #2d3748;
            font-size: 1.5rem;
            margin-bottom: 1rem;
          }

          .message-modal-content p {
            color: #4a5568;
            margin-bottom: 1.5rem;
            line-height: 1.5;
          }

          .message-modal-content button {
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease, transform 0.2s ease;
          }

          .message-modal-content button:hover {
            background: linear-gradient(45deg, #3a00b0, #7e1de1);
            transform: translateY(-2px);
          }


          /* Responsive Design */
          @media (max-width: 1024px) {
            .admin-content {
              padding: 1.5rem;
            }
            .admin-welcome {
              font-size: 2.2rem;
            }
            .admin-stats-grid {
              grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
              gap: 1rem;
            }
            .admin-card h2 {
              font-size: 1.8rem;
            }
            .filter-buttons {
              gap: 0.8rem;
            }
            .admin-projects-grid {
              grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            }
            .admin-project-card {
              padding: 1.5rem;
            }
            .project-info-grid {
              grid-template-columns: 1fr;
            }
            .admin-actions {
              flex-direction: column;
            }
          }

          @media (max-width: 768px) {
            .admin-navbar {
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;
            }
            .admin-nav-links {
              gap: 1rem;
            }
            .admin-welcome {
              font-size: 1.8rem;
            }
            .tab-btn-container {
                flex-direction: column;
                gap: 1rem;
            }
            .tab-btn {
                width: 100%;
            }
            .admin-stats-grid {
              grid-template-columns: 1fr;
              gap: 1rem;
            }
            .filter-buttons {
              flex-direction: column;
              align-items: center;
            }
            .filter-buttons button {
              width: 90%;
            }
            .admin-projects-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .admin-content {
              padding: 0.8rem;
            }
            .admin-welcome {
              font-size: 1.5rem;
            }
            .admin-card h2 {
              font-size: 1.5rem;
            }
            .admin-project-card {
              padding: 1rem;
            }
            .project-title {
              font-size: 1.3rem;
            }
            .admin-actions {
              font-size: 0.85rem;
              padding: 0.6rem 1rem;
            }
          }
        `}
      </style>

      {}
      <nav className="admin-navbar">
        <div className="admin-logo">🛡️ Admin Panel</div>
        <div className="admin-nav-links">
          <span>Welcome, Admin</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="admin-content">
        <h1 className="admin-welcome">Project Management Dashboard</h1>

        {}
        <div className="tab-btn-container">
          <button
            className="tab-btn active"
            onClick={() => navigate('/admin/dashboard')}
          >
            📊 Project Dashboard
          </button>
          <button
            className="tab-btn" 
            onClick={() => navigate('/admin/investments')}
          >
            💰 Manage Investments
          </button>
        </div>

        {}
        <div className="admin-stats-grid">
          <div className="admin-card total">
            <p>Total Projects</p>
            <h2>{stats.total}</h2>
          </div>
          <div className="admin-card pending">
            <p>Pending Review</p>
            <h2>{stats.pending}</h2>
          </div>
          <div className="admin-card review">
            <p>Under Review</p>
            <h2>{stats.underReview}</h2>
          </div>
          <div className="admin-card approved">
            <p>Approved</p>
            <h2>{stats.approved}</h2>
          </div>
          <div className="admin-card rejected">
            <p>Rejected</p>
            <h2>{stats.rejected}</h2>
          </div>
        </div>

        {}
        <div className="filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Projects
          </button>
          <button
            className={filter === 'Pending' ? 'active' : ''}
            onClick={() => setFilter('Pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={filter === 'Under Review' ? 'active' : ''}
            onClick={() => setFilter('Under Review')}
          >
            Under Review ({stats.underReview})
          </button>
          <button
            className={filter === 'Approved' ? 'active' : ''}
            onClick={() => setFilter('Approved')}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={filter === 'Rejected' ? 'active' : ''}
            onClick={() => setFilter('Rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {}
        <div className="admin-projects-section">
          <h2>Projects for Review</h2>
          {filteredProjects.length === 0 ? (
            <div className="no-projects">
              <p>No projects found for the selected filter.</p>
            </div>
          ) : (
            <div className="admin-projects-grid">
              {filteredProjects.map(project => (
                <div key={project._id} className="admin-project-card">
                  <div className="project-status-header">
                    <span className={`admin-status-badge ${project.adminStatus.toLowerCase().replace(' ', '-')}`}>
                      {project.adminStatus}
                    </span>
                    <span className="project-date">
                      Created: {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>

                  <div className="project-info-grid">
                    <div className="info-item">
                      <strong>💰 Amount:</strong> ₹{project.amount.toLocaleString()}
                    </div>
                    <div className="info-item">
                      <strong>📍 Location:</strong> {project.location}
                    </div>
                    <div className="info-item">
                      <strong>📅 Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                    </div>
                    <div className="info-item">
                      <strong>👷 Engineer:</strong> {project.engineer || 'Not assigned'}
                    </div>
                    <div className="info-item">
                      <strong>🏷️ Priority:</strong> {project.priority}
                    </div>
                    <div className="info-item">
                      <strong>📊 Status:</strong> {project.status}
                    </div>
                  </div>

                  {project.document && (
                    <div className="document-info">
                      <strong>📎 Document:</strong>
                      <a
                        href={`http://localhost:5000/${project.document}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        View Document
                      </a>
                    </div>
                  )}

                  {project.adminStatus === 'Rejected' && project.rejectionReason && (
                    <div className="rejection-reason">
                      <strong>❌ Rejection Reason:</strong> {project.rejectionReason}
                    </div>
                  )}

                  {}
                  {project.adminStatus !== 'Approved' && project.adminStatus !== 'Rejected' && (
                    <div className="admin-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleApprove(project._id)}
                      >
                        ✅ Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleReject(project._id)}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {}
      {isMessageModalOpen && (
        <div className="message-modal-overlay">
          <div className="message-modal-content">
            <h4>Notification</h4>
            <p>{message}</p>
            <button onClick={closeMessageModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
