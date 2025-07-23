// client/src/pages/ProjectProgress.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'; // Import Recharts components

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#d0ed57'];

const ProjectProgress = () => {
  const { projectId } = useParams(); // Get project ID from URL
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State and functions for custom message modal (reused from MyInvestments)
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageCallback, setMessageCallback] = useState(null);

  const showCustomMessage = (msg, callback = null) => {
    setMessageContent(msg);
    setIsMessageModalOpen(true);
    setMessageCallback(() => callback);
  };

  const closeCustomMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageContent("");
    if (messageCallback) {
      messageCallback();
    }
    setMessageCallback(null);
  };

  const fetchProjectDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch project details (includes fundUtilizationNotes and fundUtilizationDetails)
      const response = await axios.get(`http://localhost:5000/api/projects/project/${projectId}`);
      setProject(response.data);
    } catch (err) {
      console.error('Error fetching project details:', err);
      setError('Failed to load project details. Please try again.');
      showCustomMessage('Failed to load project details. It might not exist or there was a network error.', () => navigate('/investor/my-investments'));
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading project progress...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investor-dashboard-container">
        <nav className="investor-navbar">
          <div className="investor-logo">💰 VillageFund</div>
          <div className="investor-nav-links">
            <Link to="/investor/dashboard">Dashboard</Link>
            <Link to="/investor/my-investments">My Investments</Link>
            <Link to="/investor/profile">Profile</Link>
            <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
          </div>
        </nav>
        <main className="investor-content">
          <div className="error-card">
            <h2>❌ Error Loading Data</h2>
            <p>{error}</p>
            <button
              onClick={fetchProjectDetails}
              className="retry-btn"
            >
              🔄 Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="investor-dashboard-container">
        <nav className="investor-navbar">
          <div className="investor-logo">💰 VillageFund</div>
          <div className="investor-nav-links">
            <Link to="/investor/dashboard">Dashboard</Link>
            <Link to="/investor/my-investments">My Investments</Link>
            <Link to="/investor/profile">Profile</Link>
            <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
          </div>
        </nav>
        <main className="investor-content">
          <div className="no-project-found">
            <h2>Project Not Found</h2>
            <p>The project you are looking for does not exist or has been removed.</p>
            <Link to="/investor/my-investments" className="btn-primary">Back to My Investments</Link>
          </div>
        </main>
      </div>
    );
  }

  // Prepare data for the pie chart
  const fundDetailsData = project.fundUtilizationDetails
    .filter(detail => detail.amount > 0 && detail.description.trim() !== '')
    .map(detail => ({
      name: detail.description,
      value: detail.amount
    }));

  const totalUtilized = fundDetailsData.reduce((sum, entry) => sum + entry.value, 0);
  const remainingFunds = project.amountFunded - totalUtilized;

  // Add "Unaccounted Funds" if there are remaining funds
  if (remainingFunds > 0) {
    fundDetailsData.push({ name: 'Unaccounted Funds', value: remainingFunds });
  }

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
    <div className="investor-dashboard-container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          .investor-dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          /* Navbar styles (reused from MyInvestments.js) */
          .investor-navbar {
            width: 100%;
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

          .investor-logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #4a5568;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .investor-nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
          }

          .investor-nav-links a, .investor-nav-links button {
            text-decoration: none;
            color: #4a5568;
            font-weight: 500;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            transition: all 0.3s ease;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 1rem;
          }

          .investor-nav-links a:hover, .investor-nav-links button:hover,
          .investor-nav-links a.active {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
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
          .investor-content {
            padding: 2rem;
            max-width: 1200px; /* Adjusted max-width for progress page */
            margin: 0 auto;
            width: 100%;
          }

          .progress-header {
            text-align: center;
            color: white;
            font-size: 2.8rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            font-weight: 700;
          }

          .project-progress-card {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 15px 45px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            margin-bottom: 2rem;
          }

          .project-progress-card h2 {
            font-size: 2rem;
            color: #2d3748;
            margin-bottom: 1.5rem;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
          }

          .project-progress-card h2 i {
            font-size: 1.8rem;
            color: #667eea;
          }

          .project-info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .info-item {
            background-color: #f7fafc;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
          }

          .info-item strong {
            color: #4a5568;
            font-size: 0.9rem;
            margin-bottom: 0.4rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .info-item p {
            font-size: 1.1rem;
            color: #2d3748;
            font-weight: 600;
            margin: 0;
          }

          .info-item .status-badge {
            font-size: 0.9rem;
            padding: 0.4rem 0.8rem;
            border-radius: 20px;
            font-weight: bold;
            display: inline-block;
            margin-top: 0.5rem;
          }
          .info-item .status-badge.approved { background: #48bb78; color: white; }
          .info-item .status-badge.pending { background: #ed8936; color: white; }
          .info-item .status-badge.review { background: #4299e1; color: white; }
          .info-item .status-badge.rejected { background: #f56565; color: white; }
          .info-item .status-badge.completed { background: #38a169; color: white; }
          .info-item .status-badge.in-progress { background: #3182ce; color: white; }


          .owner-notes-section {
            background-color: #f0f4f8;
            border-radius: 15px;
            padding: 2rem;
            margin-bottom: 2rem;
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);
            border: 1px solid #dbe3eb;
          }

          .owner-notes-section h3 {
            font-size: 1.5rem;
            color: #2d3748;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }

          .owner-notes-section p {
            color: #4a5568;
            line-height: 1.7;
            white-space: pre-wrap; /* Preserve line breaks */
            background-color: #e2e8f0;
            padding: 1rem;
            border-radius: 10px;
            font-size: 1rem;
            border: 1px solid #cbd5e0;
          }

          .fund-utilization-display {
            background: #ffffff;
            border-radius: 20px;
            padding: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            border: 1px solid #e2e8f0;
            margin-bottom: 2rem;
          }

          .fund-utilization-display h3 {
            font-size: 1.8rem;
            color: #2d3748;
            margin-bottom: 1.5rem;
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.8rem;
          }

          .fund-utilization-chart {
            width: 100%;
            height: 400px;
            margin-bottom: 2rem;
          }

          .fund-utilization-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1rem;
            margin-top: 1.5rem;
          }

          .fund-detail-item {
            background-color: #f0f4f8;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            border: 1px solid #dbe3eb;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
          }

          .fund-detail-item p {
            margin: 0.3rem 0;
            color: #4a5568;
            font-size: 0.95rem;
          }

          .fund-detail-item strong {
            color: #2d3748;
          }

          .fund-detail-item .amount {
            font-size: 1.1rem;
            font-weight: 700;
            color: #0088FE; /* Match chart color or a distinct one */
          }

          .total-summary-card {
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
            color: white;
            padding: 1.5rem 2rem;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            margin-top: 2rem;
          }

          .total-summary-card p {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }

          .total-summary-card h4 {
            font-size: 2.2rem;
            margin: 0;
            font-weight: 700;
          }

          .btn-back-to-investments {
            display: inline-block;
            background: linear-gradient(45deg, #764ba2, #667eea);
            color: white;
            padding: 0.8rem 1.5rem;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            text-decoration: none;
            margin-top: 2rem;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
          }

          .btn-back-to-investments:hover {
            background: linear-gradient(45deg, #6b46c1, #5a67d8);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .investor-content {
              padding: 1rem;
            }
            .progress-header {
              font-size: 2rem;
            }
            .project-progress-card {
              padding: 1.5rem;
            }
            .project-progress-card h2 {
              font-size: 1.5rem;
            }
            .project-info-grid {
              grid-template-columns: 1fr;
            }
            .owner-notes-section {
              padding: 1.2rem;
            }
            .owner-notes-section h3 {
              font-size: 1.2rem;
            }
            .owner-notes-section p {
              font-size: 0.9rem;
            }
            .fund-utilization-display {
              padding: 1.5rem;
            }
            .fund-utilization-display h3 {
              font-size: 1.5rem;
            }
            .fund-utilization-chart {
              height: 300px;
            }
            .fund-utilization-list {
              grid-template-columns: 1fr;
            }
            .total-summary-card h4 {
              font-size: 1.8rem;
            }
          }

          @media (max-width: 480px) {
            .progress-header {
              font-size: 1.8rem;
            }
            .project-progress-card {
              padding: 1rem;
            }
            .project-progress-card h2 {
              font-size: 1.3rem;
            }
            .info-item p {
              font-size: 1rem;
            }
            .owner-notes-section p {
              font-size: 0.85rem;
            }
            .fund-utilization-display h3 {
              font-size: 1.3rem;
            }
            .fund-utilization-chart {
              height: 250px;
            }
            .fund-detail-item p {
              font-size: 0.85rem;
            }
            .total-summary-card h4 {
              font-size: 1.5rem;
            }
          }
        `}
      </style>

      <nav className="investor-navbar">
        <div className="investor-logo">💰 VillageFund</div>
        <div className="investor-nav-links">
          <Link to="/investor/dashboard">Dashboard</Link>
          <Link to="/investor/my-investments" className="active">My Investments</Link>
          <Link to="/investor/profile">Profile</Link>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
        </div>
      </nav>

      <main className="investor-content">
        <h1 className="progress-header">Project Progress for "{project.title}"</h1>

        <div className="project-progress-card">
          <h2><i className="fas fa-info-circle"></i> Project Overview</h2>
          <div className="project-info-grid">
            <div className="info-item">
              <strong><i className="fas fa-heading"></i> Project Title</strong>
              <p>{project.title}</p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-map-marker-alt"></i> Location</strong>
              <p>{project.location}</p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-calendar-alt"></i> Deadline</strong>
              <p>{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-user-tie"></i> Assigned Engineer</strong>
              <p>{project.engineer || 'Not assigned'}</p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-money-bill-wave"></i> Target Amount</strong>
              <p>₹{project.amount.toLocaleString()}</p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-hand-holding-dollar"></i> Collected Amount</strong>
              <p>₹{project.amountFunded.toLocaleString()}</p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-chart-line"></i> Project Status</strong>
              <p>
                <span className={`status-badge ${project.status.toLowerCase().replace(' ', '-')}`}>
                  {project.status}
                </span>
              </p>
            </div>
            <div className="info-item">
              <strong><i className="fas fa-user-shield"></i> Admin Status</strong>
              <p>
                <span className={getAdminStatusBadge(project.adminStatus).className}>
                  {getAdminStatusBadge(project.adminStatus).text}
                </span>
              </p>
            </div>
          </div>

          <div className="info-item" style={{ gridColumn: '1 / -1' }}> {/* Full width for description */}
            <strong><i className="fas fa-file-alt"></i> Description</strong>
            <p>{project.description}</p>
          </div>

          {project.document && (
            <div className="info-item" style={{ gridColumn: '1 / -1' }}>
              <strong><i className="fas fa-paperclip"></i> Project Document</strong>
              <p>
                <a 
                  href={`http://localhost:5000/${project.document}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="document-link"
                  style={{ color: '#667eea', textDecoration: 'underline' }}
                >
                  View Document
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Owner's Overall Notes */}
        {project.fundUtilizationNotes && project.fundUtilizationNotes.trim() !== '' && (
          <div className="owner-notes-section">
            <h3><i className="fas fa-sticky-note"></i> Owner's Latest Notes</h3>
            <p>{project.fundUtilizationNotes}</p>
          </div>
        )}

        {/* Detailed Fund Utilization and Visualization */}
        <div className="fund-utilization-display">
          <h3><i className="fas fa-chart-pie"></i> Fund Utilization Breakdown</h3>
          {fundDetailsData.length > 0 ? (
            <>
              <div className="fund-utilization-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={fundDetailsData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {fundDetailsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <h4 style={{ color: '#2d3748', fontSize: '1.4rem', marginBottom: '1rem', textAlign: 'center' }}>Detailed Expenses</h4>
              <div className="fund-utilization-list">
                {project.fundUtilizationDetails.map((detail, index) => (
                  <div key={index} className="fund-detail-item">
                    <p><strong>Description:</strong> {detail.description}</p>
                    <p><strong>Amount:</strong> <span className="amount">₹{detail.amount.toLocaleString()}</span></p>
                    <p><strong>Date:</strong> {new Date(detail.date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-data-message" style={{ textAlign: 'center', padding: '2rem', color: '#718096', backgroundColor: '#f7fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p>No detailed fund utilization data available yet from the project owner.</p>
            </div>
          )}
        </div>

        {/* Total Summary Card */}
        <div className="total-summary-card">
          <p>Total Invested in this Project</p>
          <h4>₹{project.amountFunded.toLocaleString()}</h4>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/investor/my-investments" className="btn-back-to-investments">
            <i className="fas fa-arrow-left"></i> Back to My Investments
          </Link>
        </div>
      </main>

      {isMessageModalOpen && (
        <div className="message-modal-overlay">
          <div className="message-modal-content">
            <h4>Notification</h4>
            <p>{messageContent}</p>
            <button onClick={closeCustomMessageModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectProgress;
