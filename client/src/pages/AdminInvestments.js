import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Removed Link from import as it's not directly used for navigation within this component

const AdminInvestments = () => {
  const navigate = useNavigate();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState(null);

  // State for custom modals
  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentInvestmentId, setCurrentInvestmentId] = useState(null);
  const [currentAction, setCurrentAction] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Function to show custom message modal
  const showMessageModal = (msg) => {
    setMessage(msg);
    setIsMessageModalOpen(true);
  };

  // Function to close custom message modal
  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessage('');
  };

  // Function to open confirmation modal for actions
  const openConfirmationModal = (id, action) => {
    setCurrentInvestmentId(id);
    setCurrentAction(action);
    setShowConfirmationModal(true);
  };

  // Function to close confirmation modal
  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setCurrentInvestmentId(null);
    setCurrentAction('');
  };

  // Function to open rejection reason modal
  const openRejectionReasonModal = (id) => {
    setCurrentInvestmentId(id);
    setShowRejectionModal(true);
  };

  // Function to close rejection reason modal
  const closeRejectionReasonModal = () => {
    setShowRejectionModal(false);
    setCurrentInvestmentId(null);
    setRejectionReason('');
  };

  // Fetch all investments for admin
  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const adminToken = localStorage.getItem('adminToken');
      if (!adminToken) {
        navigate('/admin/login');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/investments/admin/all', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}` // Assuming token-based auth
        }
      });
      setInvestments(response.data);
    } catch (err) {
      console.error('Error fetching investments:', err);
      if (err.response && err.response.status === 401) {
        showMessageModal('Session expired or unauthorized. Please login again.');
        navigate('/admin/login');
      } else {
        setError('Failed to fetch investments. Please check server status.');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]); // Added navigate to useCallback dependencies

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]); // Added fetchInvestments to useEffect dependencies

  // Handle investment actions (Approve, Reject, Keep in Review)
  const handleInvestmentAction = async (id, action, reason = '') => {
    closeConfirmationModal(); // Close confirmation modal if open
    closeRejectionReasonModal(); // Close rejection modal if open
    try {
      const adminToken = localStorage.getItem('adminToken');
      const response = await axios.put(`http://localhost:5000/api/investments/admin/${id}`, {
        action,
        rejectionReason: reason
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.data.success) {
        showMessageModal(`Investment ${action.replace('under review', 'kept under review')} successfully!`);
        fetchInvestments(); // Refresh the list
      }
    } catch (err) {
      console.error('Error updating investment:', err);
      showMessageModal(err.response?.data?.message || 'Failed to update investment. Please try again.');
    }
  };

  // Filter investments based on status
  const filteredInvestments = investments.filter(investment => {
    if (filter === 'all') return true;
    return investment.status.toLowerCase() === filter.toLowerCase();
  });

  // eslint-disable-next-line no-unused-vars
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '#48bb78'; // Green
      case 'pending': return '#ed8936'; // Orange
      case 'rejected': return '#f56565'; // Red
      case 'under review': return '#4299e1'; // Blue
      default: return '#a0aec0'; // Gray
    }
  };

  // Get status icon for badges
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      case 'under review': return '👀';
      default: return '📋';
    }
  };

  // Calculate stats for filter buttons
  const stats = {
    total: investments.length,
    pending: investments.filter(inv => inv.status === 'Pending').length,
    underReview: investments.filter(inv => inv.status === 'Under Review').length,
    approved: investments.filter(inv => inv.status === 'Approved').length,
    rejected: investments.filter(inv => inv.status === 'Rejected').length,
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading investments...</p>
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
            <button onClick={() => navigate('/admin/login')} className="logout-btn">Logout</button>
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
            <h2>❌ Error Loading Investments</h2>
            <p>{error}</p>
            <button
              onClick={fetchInvestments}
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
      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Embedded CSS for Admin Dashboard and Investments */}
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

          /* Filter Buttons for Investments */
          .investment-filter-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            margin-bottom: 2.5rem;
            flex-wrap: wrap;
          }

          .investment-filter-buttons button {
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

          .investment-filter-buttons button:hover {
            background: rgba(255, 255, 255, 1);
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }

          .investment-filter-buttons button.active {
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            color: white;
            box-shadow: 0 4px 15px rgba(142, 45, 226, 0.3);
            transform: translateY(-2px);
          }

          /* Investments List Section */
          .admin-investments-section {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }

          .admin-investments-section h2 {
            color: #2d3748;
            font-size: 2rem;
            margin-bottom: 2rem;
            text-align: center;
            font-weight: 700;
          }

          .admin-investments-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
            gap: 2rem;
          }

          /* Investment Card for Admin */
          .admin-investment-card {
            background: linear-gradient(145deg, #ffffff, #f7fafc);
            border-radius: 16px;
            padding: 1.8rem;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
          }

          .admin-investment-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(45deg, #4a00e0, #8e2de2); /* Purple gradient top border */
          }

          .admin-investment-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
          }

          .investment-status-header {
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


          .investment-card-date {
            font-size: 0.9rem;
            color: #718096;
          }

          .admin-investment-card h3 {
            color: #2d3748;
            font-size: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: 700;
          }

          .investment-meta-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0.8rem;
            margin-bottom: 1.2rem;
            padding-bottom: 1.2rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .meta-item {
            font-size: 0.95rem;
            color: #4a5568;
          }

          .meta-item strong {
            color: #2d3748;
          }

          .investment-amount-display {
            background: #edf2f7;
            padding: 0.8rem 1.2rem;
            border-radius: 10px;
            margin-bottom: 1.2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
            color: #2d3748;
            font-size: 1.1rem;
          }

          .investment-amount-display span:first-child {
            color: #718096;
          }

          .investment-amount-display span:last-child {
            font-size: 1.5rem;
            background: linear-gradient(45deg, #4a00e0, #8e2de2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .bank-details-section, .personal-details-section {
            background: #f7fafc;
            border-radius: 10px;
            padding: 1rem 1.2rem;
            margin-bottom: 1.2rem;
            border: 1px solid #e2e8f0;
          }

          .bank-details-section h4, .personal-details-section h4 {
            color: #2d3748;
            font-size: 1.1rem;
            margin-top: 0;
            margin-bottom: 0.8rem;
            border-bottom: 1px dashed #cbd5e0;
            padding-bottom: 0.5rem;
          }

          .detail-row-item {
            display: flex;
            justify-content: space-between;
            font-size: 0.9rem;
            color: #4a5568;
            margin-bottom: 0.4rem;
          }

          .detail-row-item strong {
            color: #2d3748;
          }

          .investment-reason-display {
            background: #ebf8ff;
            color: #2b6cb0;
            padding: 0.8rem;
            border-radius: 10px;
            border-left: 4px solid #3182ce;
            font-size: 0.9rem;
            margin-bottom: 1.5rem;
          }

          .rejection-info {
            background: #fed7d7;
            color: #e53e3e;
            padding: 0.8rem;
            border-radius: 10px;
            border-left: 4px solid #e53e3e;
            font-size: 0.9rem;
            margin-top: 1rem;
          }

          /* Admin Action Buttons */
          .admin-investment-actions {
            display: flex;
            gap: 0.8rem;
            margin-top: auto;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
          }

          .action-btn {
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

          .action-btn.approve {
            background: linear-gradient(45deg, #48bb78, #38a169);
            color: white;
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
          }

          .action-btn.approve:hover {
            background: linear-gradient(45deg, #38a169, #2f855a);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
          }

          .action-btn.reject {
            background: linear-gradient(45deg, #f56565, #e53e3e);
            color: white;
            box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3);
          }

          .action-btn.reject:hover {
            background: linear-gradient(45deg, #e53e3e, #c53030);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(229, 62, 62, 0.4);
          }

          .action-btn.review {
            background: linear-gradient(45deg, #4299e1, #3182ce);
            color: white;
            box-shadow: 0 4px 15px rgba(66, 153, 225, 0.3);
          }

          .action-btn.review:hover {
            background: linear-gradient(45deg, #3182ce, #2c5282);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(49, 130, 206, 0.4);
          }

          /* No Investments State */
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

          /* Confirmation Modal Specific Styles */
          .confirmation-modal-buttons {
            display: flex;
            justify-content: space-around;
            gap: 1rem;
          }
          .confirmation-modal-buttons button {
            flex: 1;
          }
          .confirmation-modal-buttons .cancel-btn {
            background: #e2e8f0;
            color: #4a5568;
          }
          .confirmation-modal-buttons .cancel-btn:hover {
            background: #cbd5e0;
            transform: translateY(-2px);
          }

          /* Rejection Modal Specific Styles */
          .rejection-modal-content input[type="text"] {
            width: calc(100% - 2rem);
            padding: 0.8rem 1rem;
            margin-bottom: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 1rem;
            color: #2d3748;
            background-color: #f7fafc;
          }
          .rejection-modal-content input[type="text"]:focus {
            outline: none;
            border-color: #4a00e0;
            box-shadow: 0 0 0 3px rgba(74, 0, 224, 0.25);
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
            .investment-filter-buttons {
              gap: 0.8rem;
            }
            .admin-investments-grid {
              grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            }
            .admin-investment-card {
              padding: 1.5rem;
            }
            .investment-meta-info {
              grid-template-columns: 1fr;
            }
            .admin-investment-actions {
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
            .investment-filter-buttons {
              flex-direction: column;
              align-items: center;
            }
            .investment-filter-buttons button {
              width: 90%;
            }
            .admin-investments-grid {
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
            .admin-investment-card {
              padding: 1rem;
            }
            .admin-investment-card h3 {
              font-size: 1.3rem;
            }
            .investment-amount-display span:last-child {
              font-size: 1.3rem;
            }
            .investment-actions {
              font-size: 0.85rem;
              padding: 0.6rem 1rem;
            }
          }
        `}
      </style>

      {/* Admin Navbar */}
      <nav className="admin-navbar">
        <div className="admin-logo">🛡️ Admin Panel</div>
        <div className="admin-nav-links">
          <span>Welcome, Admin</span>
          <button onClick={() => navigate('/admin/login')} className="logout-btn">Logout</button>
        </div>
      </nav>

      <main className="admin-content">
        <h1 className="admin-welcome">Manage Investments</h1>

        {/* Navigation Tabs */}
        <div className="tab-btn-container">
          <button
            className="tab-btn"
            onClick={() => navigate('/admin/dashboard')}
          >
            📊 Project Dashboard
          </button>
          <button
            className="tab-btn active" // Mark as active
            onClick={() => navigate('/admin/investments')}
          >
            💰 Manage Investments
          </button>
        </div>

        {/* Investment Filter Buttons */}
        <div className="investment-filter-buttons">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All ({stats.total})
          </button>
          <button
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
          <button
            className={filter === 'under review' ? 'active' : ''}
            onClick={() => setFilter('under review')}
          >
            Under Review ({stats.underReview})
          </button>
          <button
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({stats.approved})
          </button>
          <button
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({stats.rejected})
          </button>
        </div>

        {/* Investments List */}
        <div className="admin-investments-section">
          <h2>Investment Requests</h2>
          {filteredInvestments.length === 0 ? (
            <div className="no-projects">
              <h3>No investments found for the selected filter.</h3>
              <p>Looks like there are no investment requests to manage at the moment.</p>
            </div>
          ) : (
            <div className="admin-investments-grid">
              {filteredInvestments.map(investment => (
                <div key={investment._id} className="admin-investment-card">
                  <div className="investment-status-header">
                    <span className={`admin-status-badge ${investment.status.toLowerCase().replace(' ', '-')}`}>
                      {getStatusIcon(investment.status)} {investment.status}
                    </span>
                    <span className="investment-card-date">
                      Applied: {new Date(investment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3>Project: {investment.projectId?.title || 'N/A'}</h3>
                  <div className="investment-meta-info">
                    <div className="meta-item">
                      <strong>Project Location:</strong> {investment.projectId?.location || 'N/A'}
                    </div>
                    <div className="meta-item">
                      <strong>Investor Email:</strong> {investment.investorId?.email || 'N/A'}
                    </div>
                  </div>

                  <div className="investment-amount-display">
                    <span>Investment Amount:</span>
                    <span>₹{investment.amount.toLocaleString()}</span>
                  </div>

                  {/* Bank Details */}
                  <div className="bank-details-section">
                    <h4>Bank Details</h4>
                    <div className="detail-row-item">
                      <span>Account Holder:</span>
                      <strong>{investment.bankDetails?.accountHolderName || 'N/A'}</strong>
                    </div>
                    <div className="detail-row-item">
                      <span>Account Number:</span>
                      <strong>{investment.bankDetails?.accountNumber || 'N/A'}</strong>
                    </div>
                    <div className="detail-row-item">
                      <span>Bank Name:</span>
                      <strong>{investment.bankDetails?.bankName || 'N/A'}</strong>
                    </div>
                    <div className="detail-row-item">
                      <span>Bank Branch:</span>
                      <strong>{investment.bankDetails?.bankBranch || 'N/A'}</strong>
                    </div>
                    <div className="detail-row-item">
                      <span>IFSC Code:</span>
                      <strong>{investment.bankDetails?.ifscCode || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Personal Details */}
                  <div className="personal-details-section">
                    <h4>Personal Details</h4>
                    <div className="detail-row-item">
                      <span>PAN Number:</span>
                      <strong>{investment.personalDetails?.panNumber || 'N/A'}</strong>
                    </div>
                    <div className="detail-row-item">
                      <span>Aadhar Number:</span>
                      <strong>{investment.personalDetails?.aadharNumber || 'N/A'}</strong>
                    </div>
                  </div>

                  {investment.investmentReason && (
                    <div className="investment-reason-display">
                      <strong>Reason for Investment:</strong> {investment.investmentReason}
                    </div>
                  )}

                  {investment.status === 'Rejected' && investment.rejectionReason && (
                    <div className="rejection-info">
                      <strong>Rejection Reason:</strong> {investment.rejectionReason}
                    </div>
                  )}

                  {investment.status === 'Approved' && investment.adminApprovedAt && (
                    <div className="approval-info">
                      <strong>Approved on:</strong> {new Date(investment.adminApprovedAt).toLocaleDateString()}
                    </div>
                  )}

                  {/* Admin Action Buttons */}
                  {(investment.status === 'Pending' || investment.status === 'Under Review') && (
                    <div className="admin-investment-actions">
                      <button
                        className="action-btn approve"
                        onClick={() => openConfirmationModal(investment._id, 'approve')}
                      >
                        <i className="fas fa-check-circle"></i> Approve
                      </button>
                      <button
                        className="action-btn reject"
                        onClick={() => openRejectionReasonModal(investment._id)}
                      >
                        <i className="fas fa-times-circle"></i> Reject
                      </button>
                      {investment.status === 'Pending' && ( 
                        <button
                          className="action-btn review"
                          onClick={() => openConfirmationModal(investment._id, 'under review')}
                        >
                          <i className="fas fa-hourglass-half"></i> Keep in Review
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Custom Message Modal */}
      {isMessageModalOpen && (
        <div className="message-modal-overlay">
          <div className="message-modal-content">
            <h4>Notification</h4>
            <p>{message}</p>
            <button onClick={closeMessageModal}>OK</button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="message-modal-overlay">
          <div className="message-modal-content">
            <h4>Confirm Action</h4>
            <p>Are you sure you want to {currentAction === 'approve' ? 'approve' : 'keep under review'} this investment?</p>
            <div className="confirmation-modal-buttons">
              <button onClick={closeConfirmationModal} className="cancel-btn">Cancel</button>
              <button onClick={() => handleInvestmentAction(currentInvestmentId, currentAction)}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectionModal && (
        <div className="message-modal-overlay">
          <div className="message-modal-content rejection-modal-content">
            <h4>Reject Investment</h4>
            <p>Please provide a reason for rejecting this investment:</p>
            <input
              type="text"
              placeholder="Enter rejection reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="confirmation-modal-buttons">
              <button onClick={closeRejectionReasonModal} className="cancel-btn">Cancel</button>
              <button onClick={() => handleInvestmentAction(currentInvestmentId, 'reject', rejectionReason)} disabled={!rejectionReason.trim()}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInvestments;
