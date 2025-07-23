// client/src/OwnerInvestments.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './OwnerDashboard.css'; // Reusing the owner dashboard CSS for styling consistency



const OwnerInvestments = () => {
  const navigate = useNavigate();
  const [ownerProjects, setOwnerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fundUtilizationNotes, setFundUtilizationNotes] = useState({}); // State for overall notes
  // NEW: State to manage detailed fund utilization entries for each project
  const [fundUtilizationDetails, setFundUtilizationDetails] = useState({});

  // State and functions for custom message modal
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [messageCallback, setMessageCallback] = useState(null);

  const showCustomMessage = (msg, callback = null) => {
    setMessageContent(msg);
    setIsMessageModalOpen(true);
    setMessageCallback(() => callback); // Store callback to execute after modal closes
  };

  const closeCustomMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessageContent("");
    if (messageCallback) {
      messageCallback(); // Execute callback if it exists
    }
    setMessageCallback(null); // Clear callback
  };

  // Fetch owner's projects and their associated investments
  const fetchOwnerData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = JSON.parse(localStorage.getItem('user'));

      if (!userData || !userData.id) {
        showCustomMessage("Please login again. User data not found.", () => navigate('/login'));
        return;
      }
      
      // 1. Fetch owner's projects (now includes fundUtilizationNotes and fundUtilizationDetails)
      const projectsResponse = await axios.get(`http://localhost:5000/api/projects/owner/${userData.id}`);
      const projects = projectsResponse.data;

      // Initialize states for each project
      const initialNotes = {};
      const initialDetails = {};
      projects.forEach(project => {
        initialNotes[project._id] = project.fundUtilizationNotes || '';
        // Ensure fundUtilizationDetails is an array and each amount is a number
        initialDetails[project._id] = (project.fundUtilizationDetails || []).map(detail => ({
          ...detail,
          amount: parseFloat(detail.amount) || '' // Convert to number or empty string if invalid
        }));
      });
      setFundUtilizationNotes(initialNotes);
      setFundUtilizationDetails(initialDetails); // Set initial details from fetched data

      // 2. For each project, fetch its investments
      const projectsWithInvestments = await Promise.all(
        projects.map(async (project) => {
          try {
            const investmentsResponse = await axios.get(`http://localhost:5000/api/investments/project/${project._id}`);
            return {
              ...project,
              investments: investmentsResponse.data,
            };
          } catch (invErr) {
            console.error(`Error fetching investments for project ${project._id}:`, invErr);
            return { ...project, investments: [] };
          }
        })
      );
      setOwnerProjects(projectsWithInvestments);
    } catch (err) {
      console.error('Error fetching owner data:', err);
      setError('Failed to load your projects and investments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchOwnerData();
  }, [fetchOwnerData]);

  // Handle updating overall fund utilization notes
  const handleUpdateFundUtilizationNotes = async (projectId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        showCustomMessage("You are not logged in. Please login as owner.");
        return;
      }

      const response = await axios.patch(`http://localhost:5000/api/projects/notes/${projectId}`,
        { fundUtilizationNotes: fundUtilizationNotes[projectId] },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) { 
        showCustomMessage("Overall fund utilization notes updated successfully!");
      }
    } catch (err) {
      console.error('Error updating overall fund utilization notes:', err);
      showCustomMessage(err.response?.data?.message || 'Failed to update overall fund utilization notes.');
    }
  };

  // Handle adding a new fund utilization detail entry
  const handleAddFundDetail = (projectId) => {
    setFundUtilizationDetails(prevDetails => ({
      ...prevDetails,
      [projectId]: [...(prevDetails[projectId] || []), { amount: '', description: '' }] // New entry with empty values
    }));
  };

  // Handle changes to a specific fund utilization detail entry
  const handleFundDetailChange = (projectId, index, field, value) => {
    setFundUtilizationDetails(prevDetails => {
      const updatedDetails = [...(prevDetails[projectId] || [])];
      updatedDetails[index] = { ...updatedDetails[index], [field]: value };
      return { ...prevDetails, [projectId]: updatedDetails };
    });
  };

  // Handle removing a fund utilization detail entry
  const handleRemoveFundDetail = (projectId, index) => {
    setFundUtilizationDetails(prevDetails => {
      const updated = [...prevDetails[projectId]];
      updated.splice(index, 1);
      return { ...prevDetails, [projectId]: updated };
    });
  };

  // Handle saving all fund utilization details for a project
  const handleSaveFundDetails = async (projectId) => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (!userData || !userData.id) {
        showCustomMessage("You are not logged in. Please login as owner.");
        return;
      }

      const currentDetails = fundUtilizationDetails[projectId] || [];
      
      // Prepare details for sending to backend: filter out empty/invalid, ensure numbers
      const detailsToSend = [];
      let totalUtilized = 0;
      let validationError = false;

      for (const detail of currentDetails) {
        const amount = parseFloat(detail.amount);
        const description = detail.description ? detail.description.trim() : '';

        // Validate each entry before processing
        if (isNaN(amount) || amount < 0) {
          showCustomMessage("Please enter a valid non-negative amount for all utilization entries.");
          validationError = true;
          break;
        }
        if (description === '') {
          showCustomMessage("Please provide a description for all utilization entries.");
          validationError = true;
          break;
        }
        
        detailsToSend.push({ amount, description });
        totalUtilized += amount;
      }

      if (validationError) {
        return; // Stop if there's a validation error
      }

      const project = ownerProjects.find(p => p._id === projectId);
      const totalInvested = project ? project.amountFunded : 0;

      if (totalUtilized > totalInvested) {
        showCustomMessage(`Total utilized amount (₹${totalUtilized.toLocaleString()}) cannot exceed the total invested amount (₹${totalInvested.toLocaleString()}).`);
        return;
      }

      const response = await axios.patch(`http://localhost:5000/api/projects/fund-details/${projectId}`,
        { fundUtilizationDetails: detailsToSend }, // Send the validated and cleaned array
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        showCustomMessage("Fund utilization details updated successfully!");
        fetchOwnerData(); // Re-fetch to ensure UI reflects saved data and correct calculations
      }
    } catch (err) {
      console.error('Error saving fund utilization details:', err);
      // Display specific backend validation errors if available
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = err.response.data.errors.join('\n');
        showCustomMessage(`Failed to save details:\n${errorMessages}`);
      } else {
        showCustomMessage(err.response?.data?.message || 'Failed to save fund utilization details. Please check your inputs.');
      }
    }
  };

  // Calculate total investments received across all projects
  const totalInvestmentsReceived = ownerProjects.reduce((sum, project) => {
    return sum + (project.amountFunded || 0);
  }, 0);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your investments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <nav className="navbar">
          <div className="logo">Owner Dashboard</div>
          <div className="nav-links">
            <Link to="/owner/dashboard">Projects</Link>
            <Link to="/owner/add-project">Add New</Link>
            <Link to="/owner/investments">My Investments</Link>
            <Link to="/owner/contactPage">Contact Us</Link>
            <Link to="/">Logout</Link>
          </div>
        </nav>
        <main className="dashboard-content">
          <div className="error-card">
            <h2>❌ Error Loading Data</h2>
            <p>{error}</p>
            <button
              onClick={fetchOwnerData}
              className="retry-btn"
            >
              🔄 Retry
            </button>
          </div>
        </main>
      </div>
    );
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

  const getInvestmentStatusBadge = (status) => {
    const statusMap = {
      'Pending': { className: 'status-badge pending', text: '⏳ Pending' },
      'Approved': { className: 'status-badge approved', text: '✅ Approved' },
      'Rejected': { className: 'status-badge rejected', text: '❌ Rejected' },
      'Under Review': { className: 'status-badge under-review', text: '👀 Under Review' }
    };
    return statusMap[status] || { className: 'status-badge unknown', text: status };
  };

  return (
    <div className="dashboard-container">
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          .dashboard-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
            color: #f0f0f0;
          }

          .navbar {
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

          .logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: #333;
          }

          .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
          }

          .nav-links a {
            color: #333;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.3s ease;
            padding: 0.5rem 1rem;
            border-radius: 5px;
          }

          .nav-links a:hover {
            background: rgba(103, 126, 234, 0.1);
            color: #667eea;
            transform: translateY(-2px);
          }

          .nav-links .active-nav-link {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
            transform: translateY(-2px);
          }

          .dashboard-content {
            padding: 2rem;
            max-width: 1400px;
            margin: 0 auto;
            width: 100%;
          }

          .welcome-text {
            text-align: center;
            color: white;
            font-size: 2.8rem;
            margin-bottom: 2rem;
            text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.4);
            font-weight: 700;
          }

          .total-investments-card {
            background: linear-gradient(45deg, #4CAF50, #8BC34A);
            color: white;
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            margin-bottom: 2.5rem;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .total-investments-card h2 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            font-weight: 600;
          }

          .total-investments-card p {
            font-size: 3.5rem;
            font-weight: 700;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 1rem;
          }

          .total-investments-card p i {
            font-size: 3rem;
          }

          .projects-grid {
            display: grid;
            gap: 2.5rem;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          }

          .project-card.investment-view-card {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 20px;
            padding: 2rem;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(255, 255, 255, 0.3);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }

          .project-card.investment-view-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          }

          .project-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e0e0e0;
          }

          .project-header h3 {
            margin: 0;
            font-size: 1.6rem;
            color: #333;
            font-weight: 700;
          }

          .project-description {
            color: #555;
            margin: 1rem 0 1.5rem;
            line-height: 1.6;
          }

          .project-details p {
            margin: 0.5rem 0;
            color: #444;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
          }

          .project-details strong {
            color: #222;
          }

          .funding-progress-container {
            margin: 1.5rem 0;
            background-color: #e9ecef;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
          }

          .funding-progress-bar {
            height: 100%;
            background: linear-gradient(to right, #28a745, #218838);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
            transition: width 0.6s ease-in-out;
          }

          .fund-utilization-section {
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 15px;
            padding: 1.5rem;
            margin-top: 2rem;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
          }

          .fund-utilization-section h4 {
            color: #333;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .fund-utilization-textarea {
            width: 100%;
            min-height: 120px;
            padding: 1rem;
            border: 1px solid #ced4da;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            color: #495057;
            resize: vertical;
            transition: border-color 0.3s ease, box-shadow 0.3s ease;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);
          }

          .fund-utilization-textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
          }

          .update-fund-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            padding: 0.8rem 1.8rem;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 1rem;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
            width: auto;
          }

          .update-fund-btn:hover {
            background: linear-gradient(45deg, #5a6cdb, #6a3ea0);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
          }

          .fund-details-section {
            background-color: #f8f9fa;
            border: 1px solid #e0e0e0;
            border-radius: 15px;
            padding: 1.5rem;
            margin-top: 2rem;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
          }

          .fund-details-section h4 {
            color: #333;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .fund-detail-entry {
            display: flex;
            gap: 1rem;
            margin-bottom: 1rem;
            align-items: center;
          }

          .fund-detail-entry input[type="number"] {
            flex: 0.3;
            padding: 0.8rem;
            border: 1px solid #ced4da;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            color: #495057;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);
          }

          .fund-detail-entry input[type="text"] {
            flex: 0.7;
            padding: 0.8rem;
            border: 1px solid #ced4da;
            border-radius: 10px;
            font-family: 'Inter', sans-serif;
            font-size: 1rem;
            color: #495057;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.075);
          }

          .add-fund-detail-btn {
            background: #28a745; /* Green */
            color: white;
            border: none;
            border-radius: 50%; /* Make it round */
            width: 35px;
            height: 35px;
            font-size: 1.5rem;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
            box-shadow: 0 2px 8px rgba(40, 167, 69, 0.4);
          }

          .add-fund-detail-btn:hover {
            background: #218838;
            transform: scale(1.1);
          }

          .remove-fund-detail-btn {
            background: #dc3545; /* Red */
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 1.2rem;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: background 0.3s ease, transform 0.2s ease;
            margin-left: 0.5rem;
          }

          .remove-fund-detail-btn:hover {
            background: #c82333;
            transform: scale(1.1);
          }

          .fund-details-summary {
            margin-top: 1.5rem;
            padding: 1rem;
            background-color: #e9f5e9; /* Light green background */
            border-radius: 10px;
            border: 1px solid #d4edda;
            color: #155724;
            font-weight: 600;
          }

          .fund-details-summary span {
            font-weight: bold;
            color: #0c431d;
          }

          .investments-list-title {
            color: #333;
            font-size: 1.4rem;
            margin-top: 2.5rem;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #eee;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .investments-list {
            display: grid;
            gap: 1.2rem;
          }

          .investment-item {
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 1.2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            transition: transform 0.2s ease;
          }

          .investment-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.12);
          }

          .investment-item p {
            margin: 0.4rem 0;
            color: #555;
            font-size: 0.95rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
          }

          .investment-item strong {
            color: #333;
          }

          .status-badge {
            padding: 0.3rem 0.7rem;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: bold;
            display: inline-block;
            margin-left: 0.5rem;
          }

          .status-badge.pending { background-color: #ffc107; color: #664d03; }
          .status-badge.approved { background-color: #28a745; color: #fff; }
          .status-badge.rejected { background-color: #dc3545; color: #fff; }
          .status-badge.under-review { background-color: #17a2b8; color: #fff; }
          .status-badge.unknown { background-color: #6c757d; color: #fff; }

          .rejection-reason-small {
            background-color: #ffebeb;
            color: #dc3545;
            padding: 0.6rem;
            border-radius: 8px;
            margin-top: 0.8rem;
            font-size: 0.85rem;
            border-left: 3px solid #dc3545;
          }

          .no-investments-msg {
            text-align: center;
            color: #777;
            padding: 1.5rem;
            background-color: #f0f0f0;
            border-radius: 12px;
            margin-top: 1.5rem;
            box-shadow: inset 0 1px 5px rgba(0,0,0,0.05);
          }

          .no-projects {
            text-align: center;
            color: #fff;
            margin-top: 2rem;
            padding: 3rem;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          }

          .no-projects p {
            font-size: 1.2rem;
            margin-bottom: 1rem;
          }

          .add-first-project-btn {
            display: inline-block;
            margin-top: 1rem;
            background-color: #ffffff;
            color: #764ba2;
            padding: 0.8rem 1.5rem;
            border-radius: 30px;
            text-decoration: none;
            font-weight: bold;
            transition: background-color 0.3s, transform 0.2s;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .add-first-project-btn:hover {
            background-color: #764ba2;
            color: #fff;
            transform: translateY(-2px);
          }

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

          .error-card {
            background: rgba(255, 255, 255, 0.95);
            padding: 2.5rem;
            border-radius: 20px;
            text-align: center;
            color: #e74c3c;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            max-width: 500px;
            margin: 0 auto;
          }
          .error-card h2 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          .error-card p {
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
          }
          .retry-btn {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.8rem 2rem;
            border-radius: 25px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(118, 75, 162, 0.3);
          }
          .retry-btn:hover {
            background: linear-gradient(45deg, #5a6cdb, #6a3ea0);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(118, 75, 162, 0.4);
          }

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
            background: linear-gradient(45deg, #5a6cdb, #6a3ea0);
            transform: translateY(-2px);
          }

          @media (max-width: 1024px) {
            .dashboard-content {
              padding: 1.5rem;
            }
            .welcome-text {
              font-size: 2.2rem;
            }
            .total-investments-card p {
              font-size: 2.8rem;
            }
            .total-investments-card p i {
              font-size: 2.5rem;
            }
            .projects-grid {
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            }
            .project-card.investment-view-card {
              padding: 1.5rem;
            }
            .project-header h3 {
              font-size: 1.4rem;
            }
            .fund-utilization-section {
              padding: 1.2rem;
            }
            .investments-list-title {
              font-size: 1.2rem;
            }
          }

          @media (max-width: 768px) {
            .navbar {
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;
            }
            .nav-links {
              gap: 1rem;
              flex-wrap: wrap;
              justify-content: center;
            }
            .welcome-text {
              font-size: 1.8rem;
            }
            .total-investments-card p {
              font-size: 2.2rem;
            }
            .total-investments-card p i {
              font-size: 2rem;
            }
            .projects-grid {
              grid-template-columns: 1fr;
            }
            .project-card.investment-view-card {
              padding: 1.2rem;
            }
            .fund-utilization-textarea {
              min-height: 100px;
            }
            .update-fund-btn {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .dashboard-content {
              padding: 0.8rem;
            }
            .welcome-text {
              font-size: 1.5rem;
            }
            .total-investments-card p {
              font-size: 1.8rem;
            }
            .total-investments-card p i {
              font-size: 1.5rem;
            }
            .project-header h3 {
              font-size: 1.2rem;
            }
            .project-description {
              font-size: 0.9rem;
            }
            .project-details p {
              font-size: 0.9rem;
            }
            .fund-utilization-section {
              padding: 1rem;
            }
            .fund-utilization-textarea {
              font-size: 0.9rem;
            }
            .investments-list-title {
              font-size: 1.1rem;
            }
            .investment-item {
            padding: 1rem;
            }
            .investment-item p {
            font-size: 0.85rem;
            }
            .status-badge {
            font-size: 0.75rem;
            }
          }
        `}
      </style>

      <nav className="navbar">
        <div className="logo">Owner Dashboard</div>
        <div className="nav-links">
          <Link to="/owner/dashboard">Projects</Link>
          <Link to="/owner/add-project">Add New</Link>
          <Link to="/owner/investments" className="active-nav-link">My Investments</Link>
          <Link to="/owner/contactPage">Contact Us</Link>
          <Link to="/">Logout</Link>
        </div>
      </nav>

      <main className="dashboard-content">
        <h1 className="welcome-text">My Project Investments & Updates</h1>

        <div className="total-investments-card">
          <h2>Total Investments Received Across All Your Projects</h2>
          <p>
            <i className="fas fa-coins"></i> ₹{totalInvestmentsReceived.toLocaleString()}
          </p>
        </div>

        {ownerProjects.length === 0 ? (
          <div className="no-projects">
            <p>You haven't created any projects yet, or no investments have been made in your projects.</p>
            <Link to="/owner/add-project" className="add-first-project-btn">
              Create Your First Project
            </Link>
          </div>
        ) : (
          <div className="projects-grid">
            {ownerProjects.map(project => {
              const collectedAmount = project.amountFunded || 0;
              const targetAmount = project.amount || 0;
              const fundingPercentage = targetAmount > 0 ? (collectedAmount / targetAmount) * 100 : 0;
              const remainingAmount = targetAmount - collectedAmount;

              // Calculate total utilized amount from current details state
              const currentProjectDetails = fundUtilizationDetails[project._id] || [];
              const totalUtilized = currentProjectDetails.reduce((sum, detail) => sum + (parseFloat(detail.amount) || 0), 0);

              return (
                <div key={project._id} className="project-card investment-view-card">
                  <div className="project-header">
                    <h3>{project.title}</h3>
                    <span className={getAdminStatusBadge(project.adminStatus).className}>
                      {getAdminStatusBadge(project.adminStatus).text}
                    </span>
                  </div>
                  <p className="project-description">{project.description}</p>

                  <div className="project-details">
                    <p><strong><i className="fas fa-sack-dollar"></i> Target Amount:</strong> ₹{targetAmount.toLocaleString()}</p>
                    <p><strong><i className="fas fa-hand-holding-dollar"></i> Collected Amount:</strong> ₹{collectedAmount.toLocaleString()}</p>
                    <p><strong><i className="fas fa-money-bill-transfer"></i> Remaining to Fund:</strong> ₹{remainingAmount > 0 ? remainingAmount.toLocaleString() : '0'}</p>
                    <p><strong><i className="fas fa-check-circle"></i> Funding Status:</strong> 
                      {project.status === 'Completed' ? (
                        <span className="status-badge approved">Fully Funded</span>
                      ) : (
                        <span className="status-badge pending">In Progress</span>
                      )}
                    </p>
                    <p><strong><i className="fas fa-map-marker-alt"></i> Location:</strong> {project.location}</p>
                    <p><strong><i className="fas fa-calendar-alt"></i> Deadline:</strong> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not specified'}</p>
                  </div>

                  <div className="funding-progress-container">
                    <div
                      className="funding-progress-bar"
                      style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                    >
                      {fundingPercentage.toFixed(2)}% Funded
                    </div>
                  </div>

                  {/* Overall Fund Utilization Notes */}
                  <div className="fund-utilization-section">
                    <h4><i className="fas fa-file-invoice-dollar"></i> Overall Fund Utilization Notes</h4>
                    <textarea
                      className="fund-utilization-textarea"
                      placeholder="Describe overall fund usage and project progress."
                      value={fundUtilizationNotes[project._id] || ''}
                      onChange={(e) => setFundUtilizationNotes({ ...fundUtilizationNotes, [project._id]: e.target.value })}
                    ></textarea>
                    <button
                      className="update-fund-btn"
                      onClick={() => handleUpdateFundUtilizationNotes(project._id)}
                    >
                      <i className="fas fa-save"></i> Save Overall Notes
                    </button>
                  </div>

                  {/* NEW: Detailed Fund Utilization Entries */}
                  <div className="fund-details-section">
                    <h4><i className="fas fa-list-check"></i> Detailed Fund Utilization</h4>
                    {/* Display existing/new entries */}
                    {(fundUtilizationDetails[project._id] || []).map((detail, index) => (
                      <div key={index} className="fund-detail-entry">
                        <input
                          type="number"
                          placeholder="Amount used (₹)"
                          value={detail.amount}
                          onChange={(e) => handleFundDetailChange(project._id, index, 'amount', e.target.value)}
                          min="0"
                        />
                        <input
                          type="text"
                          placeholder="Where it was used (e.g., 'Raw materials')"
                          value={detail.description}
                          onChange={(e) => handleFundDetailChange(project._id, index, 'description', e.target.value)}
                        />
                        <button
                          className="remove-fund-detail-btn"
                          onClick={() => handleRemoveFundDetail(project._id, index)} // Use dedicated remove handler
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      className="add-fund-detail-btn"
                      onClick={() => handleAddFundDetail(project._id)}
                    >
                      <i className="fas fa-plus"></i>
                    </button>

                    {/* Summary of utilized amount */}
                    <div className="fund-details-summary">
                      Total Utilized from Details: ₹<span>{totalUtilized.toLocaleString()}</span> / Invested: ₹<span>{collectedAmount.toLocaleString()}</span>
                    </div>

                    <button
                      className="update-fund-btn"
                      onClick={() => handleSaveFundDetails(project._id)}
                      style={{ marginTop: '1.5rem' }}
                    >
                      <i className="fas fa-save"></i> Save Detailed Utilization
                    </button>
                  </div>

                  {/* Investments List for this Project */}
                  <h4 className="investments-list-title"><i className="fas fa-handshake"></i> Investments Received ({project.investments.length})</h4>
                  {project.investments.length === 0 ? (
                    <p className="no-investments-msg">No investments yet for this project.</p>
                  ) : (
                    <div className="investments-list">
                      {project.investments.map(investment => {
                        const investmentStatus = getInvestmentStatusBadge(investment.status);
                        return (
                          <div key={investment._id} className="investment-item">
                            <p><strong><i className="fas fa-user-circle"></i> Investor:</strong> {investment.investorId?.email || 'N/A'}</p>
                            <p><strong><i className="fas fa-sack-dollar"></i> Amount:</strong> ₹{investment.amount.toLocaleString()}</p>
                            <p><strong><i className="fas fa-info-circle"></i> Status:</strong> <span className={investmentStatus.className}>{investmentStatus.text}</span></p>
                            <p><strong><i className="fas fa-calendar-check"></i> Invested On:</strong> {new Date(investment.createdAt).toLocaleDateString()}</p>
                            {investment.status === 'Rejected' && investment.rejectionReason && (
                              <p className="rejection-reason-small">
                                <strong><i className="fas fa-times-circle"></i> Reason:</strong> {investment.rejectionReason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
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

export default OwnerInvestments;
