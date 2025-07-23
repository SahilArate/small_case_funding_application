import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const MyInvestments = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [totalInvested, setTotalInvested] = useState(0);
  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Removed: State for the View Details modal (showDetailsPopup, currentProjectDetails, currentOwnerDetails, detailsLoading, detailsError)

  // Function to show custom message modal (reused for general messages)
  const showMessage = (msg) => {
    setMessage(msg);
    setIsMessageModalOpen(true);
  };

  // Function to close custom message modal
  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessage('');
  };

  // Wrapped fetchMyInvestments in useCallback to resolve useEffect dependency warning
  const fetchMyInvestments = useCallback(async () => {
    try {
      const investorId = localStorage.getItem('userId') || localStorage.getItem('investorId');

      if (!investorId) {
        showMessage('Authentication required. Please login again.');
        navigate('/investor-login');
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/investments/investor/${investorId}`);
      setInvestments(response.data);
      console.log('Fetched Investments Data:', response.data); // DEBUG: Log fetched investments

      // Calculate total invested amount only for 'Approved' investments
      const total = response.data
        .filter(inv => inv.status === 'Approved')
        .reduce((sum, inv) => sum + inv.amount, 0);
      setTotalInvested(total);
    } catch (error) {
      console.error('Error fetching investments:', error);
      showMessage('Failed to fetch investments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMyInvestments();
  }, [fetchMyInvestments]);

  const filteredInvestments = investments.filter(investment => {
    if (filter === 'all') return true;
    return investment.status.toLowerCase() === filter;
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#48bb78'; // Green
      case 'pending': return '#ed8936'; // Orange
      case 'rejected': return '#f56565'; // Red
      case 'under review': return '#4299e1'; // Blue
      default: return '#a0aec0'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      case 'under review': return '👀';
      default: return '📋';
    }
  };

  // Removed: handleViewDetails function
  // Removed: closeDetailsPopup function


  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your investments...</p>
      </div>
    );
  }

  return (
    <div className="investor-dashboard-container">
      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Custom Styles for the page */}
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

          /* Navbar styles from InvestorDashboard.css */
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
          .investor-nav-links a.active { /* Added active state for current page */
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
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
          }

          .investor-welcome {
            text-align: center;
            color: white;
            font-size: 2.5rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
          }

          /* Investment Stats Section */
          .investment-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
          }

          .investment-stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 2rem;
            border-radius: 16px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .investment-stat-card:hover {
            transform: translateY(-5px);
          }

          .stat-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
            line-height: 1; /* Adjust line height for icon */
          }

          .stat-info p {
            color: #718096;
            font-size: 1.1rem;
            margin-bottom: 0.5rem;
          }

          .stat-info h2 {
            color: #2d3748;
            font-size: 2.5rem;
            margin: 0;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          /* Filter Buttons */
          .investment-filters {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2.5rem;
            flex-wrap: wrap;
          }

          .investment-filters button {
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

          .investment-filters button:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          .investment-filters button.active {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            transform: translateY(-2px);
          }

          /* Investments List Section */
          .investments-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .investments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
          }

          /* Investment Card */
          .investment-card {
            background: linear-gradient(145deg, #ffffff, #f7fafc);
            border-radius: 16px;
            padding: 1.8rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
          }

          .investment-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          }

          .investment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .investment-status {
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

          .investment-date {
            font-size: 0.9rem;
            color: #718096;
          }

          .investment-body {
            flex-grow: 1;
            margin-bottom: 1.5rem;
          }

          .investment-card h3 {
            color: #2d3748;
            font-size: 1.4rem;
            margin-bottom: 0.75rem;
            font-weight: 700;
          }

          .investment-location {
            color: #718096;
            font-size: 0.95rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.4rem;
          }

          .investment-amount {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #edf2f7;
            padding: 0.8rem 1.2rem;
            border-radius: 10px;
            margin-bottom: 1.2rem;
          }

          .amount-label {
            font-size: 0.9rem;
            color: #718096;
            font-weight: 500;
          }

          .amount-value {
            font-size: 1.3rem;
            font-weight: 700;
            color: #2d3748;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .investment-details {
            margin-bottom: 1.2rem;
            border-top: 1px solid #e2e8f0;
            padding-top: 1rem;
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: #4a5568;
            margin-bottom: 0.5rem;
          }

          .detail-item strong {
            color: #2d3748;
          }

          .rejection-reason, .approval-info {
            background: #fff5f5; /* Light red for rejection */
            color: #c53030; /* Darker red for text */
            padding: 0.8rem;
            border-radius: 10px;
            border-left: 4px solid #e53e3e;
            margin-top: 1rem;
            font-size: 0.9rem;
          }
          .approval-info {
            background: #f0fff4; /* Light green for approval */
            color: #2f855a; /* Darker green for text */
            border-left: 4px solid #48bb78;
          }

          /* Investment Actions */
          .investment-actions {
            display: flex;
            gap: 0.8rem;
            margin-top: auto; /* Push buttons to the bottom */
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
          }

          .btn-primary, .btn-secondary {
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
            text-align: center; /* For Link components */
            display: flex; /* For icons */
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }

          .btn-primary {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .btn-primary:hover {
            background: linear-gradient(45deg, #5a67d8, #6b46c1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .btn-secondary { /* This style is now unused for buttons if 'View Details' is removed */
            background: #edf2f7;
            color: #4a5568;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          .btn-secondary:hover { /* This style is now unused for buttons if 'View Details' is removed */
            background: #e2e8f0;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
          }

          /* No Investments State */
          .no-investments {
            text-align: center;
            padding: 3rem;
            color: #718096;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .empty-state h3 {
            font-size: 1.8rem;
            color: #2d3748;
            margin-bottom: 1rem;
          }

          .empty-state p {
            font-size: 1.1rem;
            margin-bottom: 2rem;
          }

          .empty-state .btn-primary {
            display: inline-flex; /* To center the button */
            margin-top: 1rem;
          }

          /* Investment Timeline */
          .investment-timeline {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-top: 3rem;
          }

          .investment-timeline h2 {
            color: #2d3748;
            font-size: 1.8rem;
            margin-bottom: 2rem;
            text-align: center;
          }

          .timeline {
            position: relative;
            padding: 20px 0;
            list-style: none;
          }

          .timeline::before {
            content: '';
            position: absolute;
            top: 0;
            bottom: 0;
            left: 50%;
            width: 2px;
            background: #e2e8f0;
            margin-left: -1px;
          }

          .timeline-item {
            margin-bottom: 20px;
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .timeline-item:nth-child(odd) {
            flex-direction: row-reverse;
          }

          .timeline-item:nth-child(even) {
            flex-direction: row;
          }

          .timeline-marker {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #667eea;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.2rem;
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1;
          }

          .timeline-content {
            background: #f7fafc;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
            width: calc(50% - 40px); /* Adjust width to account for marker */
            position: relative;
            transition: all 0.3s ease;
          }

          .timeline-item:nth-child(odd) .timeline-content {
            margin-right: 40px;
          }

          .timeline-item:nth-child(even) .timeline-content {
            margin-left: 40px;
          }

          .timeline-content:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          }

          .timeline-date {
            font-size: 0.9rem;
            color: #718096;
            margin-bottom: 0.5rem;
          }

          .timeline-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 0.5rem;
          }

          .timeline-description {
            font-size: 0.95rem;
            color: #4a5568;
          }

          /* Loading/Error Screens */
          .loading-screen, .error-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
            color: white;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            font-weight: 600;
            transition: background 0.3s ease, transform 0.2s ease;
          }

          .message-modal-content button:hover {
            background: linear-gradient(45deg, #5a67d8, #6b46c1);
            transform: translateY(-2px);
          }

          /* Responsive Design */
          @media (max-width: 768px) {
            .investor-content {
              padding: 1rem;
            }
            .investor-welcome {
              font-size: 2rem;
            }
            .investment-stats {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
            .investment-filters {
              flex-direction: column;
              align-items: center;
              gap: 0.8rem;
            }
            .investment-filters button {
              width: 80%;
            }
            .investments-grid {
              grid-template-columns: 1fr;
            }
            .investment-card {
              padding: 1.5rem;
            }
            .investment-header {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
            .investment-actions {
              flex-direction: column;
            }
            .timeline::before {
              left: 20px; /* Adjust timeline line position */
            }
            .timeline-item {
              flex-direction: column !important; /* Force column for all items */
              align-items: flex-start;
              padding-left: 40px; /* Space for the line */
            }
            .timeline-marker {
              left: 20px;
              transform: translate(-50%, -50%);
            }
            .timeline-content {
              width: 100%;
              margin-left: 0 !important; /* Remove margin for column layout */
              margin-right: 0 !important;
              margin-top: 1rem;
            }
            .timeline-item:nth-child(odd) .timeline-content,
            .timeline-item:nth-child(even) .timeline-content {
                margin-left: 0;
                margin-right: 0;
            }
          }

          @media (max-width: 480px) {
            .investor-navbar {
              padding: 0.8rem;
            }
            .investor-logo {
              font-size: 1.2rem;
            }
            .investor-nav-links {
              gap: 0.8rem;
            }
            .investor-nav-links a, .investor-nav-links button {
              padding: 0.4rem 0.8rem;
              font-size: 0.9rem;
            }
            .investor-welcome {
              font-size: 1.8rem;
            }
            .investment-stat-card {
              padding: 1.5rem;
            }
            .stat-icon {
              font-size: 2.5rem;
            }
            .stat-info h2 {
              font-size: 2rem;
            }
            .investment-filters button {
              width: 100%;
            }
            .investment-card h3 {
              font-size: 1.2rem;
            }
            .amount-value {
              font-size: 1.1rem;
            }
            .btn-primary, .btn-secondary {
              font-size: 0.85rem;
              padding: 0.6rem 1rem;
            }
          }

          /* Removed: Styles for the Details Pop-up */
        `}
      </style>

      {/* Investor Navbar */}
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
        <h1 className="investor-welcome">My Investment Portfolio 📊</h1>

        {/* Investment Stats */}
        <div className="investment-stats">
          <div className="investment-stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <p>Total Invested</p>
              <h2>₹{totalInvested.toLocaleString()}</h2>
            </div>
          </div>
          <div className="investment-stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <p>Total Investments</p>
              <h2>{investments.length}</h2>
            </div>
          </div>
          <div className="investment-stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <p>Approved</p>
              <h2>{investments.filter(inv => inv.status === 'Approved').length}</h2>
            </div>
          </div>
          <div className="investment-stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p>Pending</p>
              <h2>{investments.filter(inv => inv.status === 'Pending').length}</h2>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="investment-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Investments
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </button>
          <button
            className={filter === 'under review' ? 'active' : ''}
            onClick={() => setFilter('under review')}
          >
            Under Review
          </button>
        </div>

        {/* Investments List */}
        <div className="investments-section">
          {filteredInvestments.length === 0 ? (
            <div className="no-investments">
              <div className="empty-state">
                <h3>📊 No investments found</h3>
                <p>
                  {filter === 'all'
                    ? "You haven't made any investments yet. Start by exploring available projects!"
                    : `No ${filter} investments found.`
                  }
                </p>
                <Link to="/investor/dashboard" className="btn-primary">
                  Explore Projects
                </Link>
              </div>
            </div>
          ) : (
            <div className="investments-grid">
              {filteredInvestments.map(investment => (
                <div key={investment._id} className="investment-card">
                  <div className="investment-header">
                    <div className="investment-status" style={{ backgroundColor: getStatusColor(investment.status) }}>
                      {getStatusIcon(investment.status)} {investment.status}
                    </div>
                    <div className="investment-date">
                      {new Date(investment.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="investment-body">
                    <h3>{investment.projectId?.title || 'Project Title N/A'}</h3>
                    <p className="investment-location">
                      <i className="fas fa-map-marker-alt"></i> {investment.projectId?.location || 'Location N/A'}
                    </p>

                    <div className="investment-amount">
                      <span className="amount-label">Investment Amount</span>
                      <span className="amount-value">₹{investment.amount.toLocaleString()}</span>
                    </div>

                    <div className="investment-details">
                      <div className="detail-item">
                        <strong>Bank:</strong> {investment.bankDetails?.bankName || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>Account:</strong> ****{investment.bankDetails?.accountNumber?.slice(-4) || 'N/A'}
                      </div>
                      {investment.investmentReason && (
                        <div className="detail-item">
                          <strong>Reason:</strong> {investment.investmentReason}
                        </div>
                      )}
                    </div>

                    {investment.status === 'Rejected' && investment.rejectionReason && (
                      <div className="rejection-reason">
                        <strong>Rejection Reason:</strong> {investment.rejectionReason}
                      </div>
                    )}

                    {investment.status === 'Approved' && investment.adminApprovedAt && (
                      <div className="approval-info">
                        <strong>Approved on:</strong> {new Date(investment.adminApprovedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="investment-actions">
                    {/* Removed the "View Details" button */}
                    {investment.status === 'Approved' && investment.projectId?._id && (
                      <Link to={`/investor/project-progress/${investment.projectId._id}`} className="btn-primary" style={{ width: '100%' }}> {/* Make it full width */}
                        <i className="fas fa-chart-line"></i> Track Progress
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Investment Timeline */}
        {investments.length > 0 && (
          <div className="investment-timeline">
            <h2>Recent Investment Activity</h2>
            <div className="timeline">
              {investments.slice(0, 5).map((investment, index) => ( // Displaying only latest 5 for brevity
                <div key={investment._id} className="timeline-item">
                  <div className="timeline-marker" style={{ backgroundColor: getStatusColor(investment.status) }}>
                    {getStatusIcon(investment.status)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-date">
                      {new Date(investment.createdAt).toLocaleDateString()}
                    </div>
                    <div className="timeline-title">
                      {investment.projectId?.title || 'Project N/A'}
                    </div>
                    <div className="timeline-description">
                      Invested ₹{investment.amount.toLocaleString()} - {investment.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Custom Message Modal (for general messages) */}
      {isMessageModalOpen && (
        <div className="message-modal-overlay">
          <div className="message-modal-content">
            <h4>Notification</h4>
            <p>{message}</p>
            <button onClick={closeMessageModal}>OK</button>
          </div>
        </div>
      )}

      {/* Removed: Project and Owner Details Pop-up JSX */}
    </div>
  );
};

export default MyInvestments;
