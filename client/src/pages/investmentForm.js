import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Main InvestmentForm component
const InvestmentForm = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State variables for project details, loading, submitting, form data, errors, and active section
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [investmentData, setInvestmentData] = useState({
    amount: '',
    bankAccountNumber: '',
    bankName: '',
    bankBranch: '',
    ifscCode: '',
    accountHolderName: '',
    investmentReason: '',
    panNumber: '',
    aadharNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState('amount'); // Controls which form section is visible
  const [message, setMessage] = useState(''); // For custom alert messages
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Controls message modal visibility

  // Function to show custom message modal
  const showMessage = (msg) => {
    setMessage(msg);
    setIsMessageModalOpen(true);
  };

  // Function to close custom message modal
  const closeMessageModal = () => {
    setIsMessageModalOpen(false);
    setMessage('');
  };

  // Callback to fetch project details from the backend
  const fetchProjectDetails = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/project/${projectId}`);
      setProject(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
      if (error.response?.status === 404) {
        showMessage('Project not found. Redirecting to dashboard.');
      } else {
        showMessage('Failed to fetch project details. Please try again.');
      }
      navigate('/investor/dashboard'); // Redirect on error
    } finally {
      setLoading(false); // Set loading to false regardless of success or failure
    }
  }, [projectId, navigate]); // Dependencies for useCallback

  // Effect hook to call fetchProjectDetails when the component mounts or dependencies change
  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  // Handler for input changes in the form fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvestmentData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error message for the field as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate Investment Amount section
    if (activeSection === 'amount' || activeSection === 'review') {
      if (!investmentData.amount || parseFloat(investmentData.amount) <= 0) {
        newErrors.amount = 'Investment amount is required and must be positive.';
      } else if (project && parseFloat(investmentData.amount) > project.amount) {
        newErrors.amount = `Amount cannot exceed project total (₹${project.amount.toLocaleString()}).`;
      }
    }

    // Validate Bank Details section
    if (activeSection === 'bank' || activeSection === 'review') {
      if (!investmentData.bankAccountNumber || investmentData.bankAccountNumber.length < 9) {
        newErrors.bankAccountNumber = 'Valid bank account number is required (min 9 digits).';
      }
      if (!investmentData.accountHolderName.trim()) {
        newErrors.accountHolderName = 'Account holder name is required.';
      }
      if (!investmentData.bankName.trim()) {
        newErrors.bankName = 'Bank name is required.';
      }
      if (!investmentData.ifscCode || investmentData.ifscCode.length !== 11) {
        newErrors.ifscCode = 'Valid IFSC code is required (11 characters).';
      }
    }

    // Validate Personal Details section
    if (activeSection === 'personal' || activeSection === 'review') {
      if (!investmentData.panNumber || investmentData.panNumber.length !== 10) {
        newErrors.panNumber = 'Valid PAN number is required (10 characters).';
      }
      if (!investmentData.aadharNumber || investmentData.aadharNumber.length !== 12) {
        newErrors.aadharNumber = 'Valid Aadhar number is required (12 digits).';
      }
    }

    setErrors(newErrors); // Update errors state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Validate the entire form before submission
    if (!validateForm()) {
      // If validation fails, ensure the first section with errors is active
      if (errors.amount) setActiveSection('amount');
      else if (errors.bankAccountNumber || errors.accountHolderName || errors.bankName || errors.ifscCode) setActiveSection('bank');
      else if (errors.panNumber || errors.aadharNumber) setActiveSection('personal');
      showMessage('Please correct the errors in the form before submitting.');
      return;
    }

    setSubmitting(true); // Set submitting state to true

    try {
      // Retrieve investor ID from local storage
      const investorId = localStorage.getItem('userId') || localStorage.getItem('investorId');

      if (!investorId) {
        showMessage('Authentication required. Please login again to continue.');
        navigate('/investor-login'); // Redirect to login if ID is missing
        return;
      }

      // Prepare the investment payload
      const investmentPayload = {
        projectId: project._id,
        investorId: investorId,
        amount: parseFloat(investmentData.amount),
        bankDetails: {
          accountNumber: investmentData.bankAccountNumber,
          bankName: investmentData.bankName,
          bankBranch: investmentData.bankBranch,
          ifscCode: investmentData.ifscCode.toUpperCase(),
          accountHolderName: investmentData.accountHolderName
        },
        personalDetails: {
          panNumber: investmentData.panNumber.toUpperCase(),
          aadharNumber: investmentData.aadharNumber
        },
        investmentReason: investmentData.investmentReason || 'Investment in village project',
        status: 'Pending' // Initial status of the investment
      };

      // Send POST request to the backend API
      const response = await axios.post(
        'http://localhost:5000/api/investments/create',
        investmentPayload
      );

      // Handle successful submission
      if (response.status === 201) {
        showMessage('Investment request submitted successfully! It will be reviewed by admin.');
        navigate('/investor/my-investments'); // Redirect to my investments page
      }
    } catch (error) {
      console.error('Error submitting investment:', error);
      showMessage(error.response?.data?.message || 'Failed to submit investment request. Please try again.');
    } finally {
      setSubmitting(false); // Reset submitting state
    }
  };

  // Render loading state while fetching project details
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  // Render error state if project not found after loading
  if (!project) {
    return <div className="error-screen">Project not found or an error occurred.</div>;
  }

  return (
    <div className="investment-form-container">
      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Custom Styles for the form */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          .investment-form-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 3rem; /* Space for the security notice */
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

          .investor-nav-links a:hover, .investor-nav-links button:hover {
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

          /* Form Wrapper */
          .investment-form-wrapper {
            display: flex;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(15px);
            border-radius: 25px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            margin: 3rem auto;
            max-width: 1200px;
            width: 95%;
            overflow: hidden;
          }

          /* Progress Sidebar */
          .form-progress-sidebar {
            width: 300px;
            padding: 2.5rem 2rem;
            background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            box-shadow: inset -5px 0 15px rgba(0, 0, 0, 0.1);
          }

          .progress-step {
            display: flex;
            align-items: center;
            gap: 1rem;
            cursor: pointer;
            padding: 0.75rem;
            border-radius: 10px;
            transition: background 0.3s ease, transform 0.2s ease;
            opacity: 0.7;
          }

          .progress-step:hover {
            background: rgba(255, 255, 255, 0.1);
            transform: translateX(5px);
          }

          .progress-step.active {
            background: rgba(255, 255, 255, 0.2);
            opacity: 1;
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
            transform: translateX(0);
          }

          .step-number {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: white;
            color: #667eea;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 700;
            font-size: 1.2rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          }

          .progress-step.active .step-number {
            background: #48bb78; /* Green for active step number */
            color: white;
          }

          .step-info {
            display: flex;
            flex-direction: column;
          }

          .step-title {
            font-weight: 600;
            font-size: 1.1rem;
          }

          .step-description {
            font-size: 0.85rem;
            color: rgba(255, 255, 255, 0.8);
          }

          /* Form Content Area */
          .form-content-area {
            flex-grow: 1;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          /* Project Summary Card */
          .project-summary-card {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
            background: linear-gradient(145deg, #ffffff, #f7fafc);
          }

          .project-title {
            font-size: 2rem;
            color: #2d3748;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .project-meta {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-bottom: 1rem;
            flex-wrap: wrap;
          }

          .location-badge, .amount-badge, .priority-badge {
            background: #edf2f7;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
            color: #4a5568;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .location-badge i, .amount-badge i, .priority-badge i {
            color: #667eea;
          }

          .project-description {
            color: #4a5568;
            line-height: 1.6;
            margin-bottom: 1.5rem;
          }

          .project-deadline {
            font-size: 1rem;
            color: #718096;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-weight: 500;
          }

          /* Form Sections */
          .form-section {
            display: none; /* Hidden by default */
            animation: fadeIn 0.5s ease-out;
          }

          .form-section.active {
            display: block; /* Active section is shown */
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .section-header {
            display: flex;
            align-items: center;
            gap: 1rem;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
          }

          .section-number {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            font-weight: 700;
            font-size: 1.3rem;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          }

          .section-header h3 {
            font-size: 1.8rem;
            color: #2d3748;
            margin: 0;
          }

          /* Form Groups and Inputs */
          .form-group {
            margin-bottom: 1.5rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.6rem;
            color: #2d3748;
            font-weight: 600;
            font-size: 1rem;
          }

          .input-with-icon {
            position: relative;
            display: flex;
            align-items: center;
          }

          .input-with-icon i {
            position: absolute;
            left: 15px;
            color: #a0aec0;
            font-size: 1rem;
          }

          .form-group input[type="text"],
          .form-group input[type="number"],
          .form-group textarea {
            width: 100%;
            padding: 0.8rem 1rem 0.8rem 45px; /* Adjust padding for icon */
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1rem;
            color: #2d3748;
            background-color: #f7fafc;
            transition: all 0.3s ease;
            box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
          }

          .form-group input[type="text"]:focus,
          .form-group input[type="number"]:focus,
          .form-group textarea:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
            background-color: white;
          }

          .form-group input.error,
          .form-group textarea.error {
            border-color: #e53e3e;
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.25);
          }

          .error-message {
            color: #e53e3e;
            font-size: 0.85rem;
            margin-top: 0.5rem;
            display: block;
            font-weight: 500;
          }

          .form-row {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .form-row .form-group {
            flex: 1;
            margin-bottom: 0; /* Override default margin */
          }

          /* Amount Slider */
          .amount-slider {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }

          .amount-slider input[type="range"] {
            width: 100%;
            -webkit-appearance: none;
            height: 8px;
            background: #e2e8f0;
            border-radius: 5px;
            outline: none;
            opacity: 0.7;
            transition: opacity 0.2s;
          }

          .amount-slider input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .amount-slider input[type="range"]::-moz-range-thumb {
            width: 25px;
            height: 25px;
            border-radius: 50%;
            background: linear-gradient(45deg, #667eea, #764ba2);
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }

          .slider-labels {
            display: flex;
            justify-content: space-between;
            margin-top: 0.5rem;
            font-size: 0.9rem;
            color: #718096;
          }

          .investment-tip, .form-hint {
            background: #ebf8ff;
            color: #2b6cb0;
            padding: 0.75rem 1rem;
            border-radius: 10px;
            border-left: 4px solid #3182ce;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            font-size: 0.9rem;
            margin-top: 1rem;
          }

          .investment-tip i, .form-hint i {
            color: #3182ce;
          }

          /* Form Navigation Buttons */
          .form-navigation {
            display: flex;
            justify-content: space-between;
            margin-top: 2.5rem;
            padding-top: 1.5rem;
            border-top: 1px solid #e2e8f0;
          }

          .btn-prev, .btn-next, .btn-submit {
            padding: 0.8rem 1.8rem;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .btn-prev {
            background: #e2e8f0;
            color: #4a5568;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          }

          .btn-prev:hover {
            background: #cbd5e0;
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
          }

          .btn-next {
            background: linear-gradient(45deg, #667eea, #764ba2);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }

          .btn-next:hover:not(:disabled) {
            background: linear-gradient(45deg, #5a67d8, #6b46c1);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }

          .btn-next:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #a0aec0;
            box-shadow: none;
          }

          .btn-submit {
            background: linear-gradient(45deg, #48bb78, #38a169);
            color: white;
            box-shadow: 0 4px 15px rgba(72, 187, 120, 0.3);
          }

          .btn-submit:hover:not(:disabled) {
            background: linear-gradient(45deg, #38a169, #2f855a);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(72, 187, 120, 0.4);
          }

          .btn-submit:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            background: #a0aec0;
            box-shadow: none;
          }

          /* Review Section */
          .review-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }

          .summary-card {
            background: #f7fafc;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }

          .summary-card h4 {
            color: #2d3748;
            font-size: 1.2rem;
            margin-bottom: 1rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.75rem;
          }

          .summary-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 0.75rem;
            font-size: 0.95rem;
            color: #4a5568;
          }

          .summary-item span {
            font-weight: 500;
            color: #718096;
          }

          .summary-item strong {
            font-weight: 600;
            color: #2d3748;
          }

          .terms-agreement {
            display: flex;
            align-items: flex-start;
            gap: 0.75rem;
            margin-top: 2rem;
            margin-bottom: 2rem;
            font-size: 0.95rem;
            color: #4a5568;
          }

          .terms-agreement input[type="checkbox"] {
            min-width: 18px;
            min-height: 18px;
            margin-top: 3px;
            cursor: pointer;
          }

          .terms-agreement a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
          }

          .terms-agreement a:hover {
            text-decoration: underline;
          }

          /* Security Notice */
          .investment-security-notice {
            background: rgba(0, 0, 0, 0.4);
            color: white;
            padding: 1rem 2rem;
            border-radius: 15px;
            margin-top: 2rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            font-size: 0.9rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(5px);
          }

          .investment-security-notice i {
            color: #48bb78;
            font-size: 1.2rem;
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
          @media (max-width: 1024px) {
            .investment-form-wrapper {
              flex-direction: column;
              margin: 2rem auto;
              width: 98%;
            }
            .form-progress-sidebar {
              width: 100%;
              flex-direction: row;
              flex-wrap: wrap;
              justify-content: center;
              padding: 1.5rem;
              gap: 1rem;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .progress-step {
              flex-direction: column;
              text-align: center;
              gap: 0.5rem;
              padding: 0.5rem;
              width: 150px; /* Adjust width for smaller screens */
            }
            .progress-step:hover {
              transform: translateY(0);
            }
            .step-info {
              align-items: center;
            }
            .form-content-area {
              padding: 1.5rem;
            }
            .project-summary-card {
              padding: 1.5rem;
            }
            .project-title {
              font-size: 1.75rem;
            }
            .project-meta {
              flex-direction: column;
              gap: 0.5rem;
            }
            .form-row {
              flex-direction: column;
              gap: 0; /* Remove gap for column layout */
            }
            .form-row .form-group {
              margin-bottom: 1.5rem; /* Restore margin for stacked groups */
            }
            .form-navigation {
              flex-direction: column;
              gap: 1rem;
            }
            .btn-prev, .btn-next, .btn-submit {
              width: 100%;
              justify-content: center;
            }
          }

          @media (max-width: 768px) {
            .investor-navbar {
              padding: 1rem;
            }
            .investor-nav-links {
              gap: 1rem;
            }
            .investor-logo {
              font-size: 1.3rem;
            }
            .progress-step {
              width: 120px; /* Further adjust for smaller screens */
            }
            .step-title {
              font-size: 1rem;
            }
            .step-description {
              font-size: 0.75rem;
            }
            .section-header h3 {
              font-size: 1.5rem;
            }
            .review-summary {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 480px) {
            .investment-form-wrapper {
              margin: 1rem auto;
              border-radius: 15px;
            }
            .form-progress-sidebar {
              padding: 1rem;
              gap: 0.5rem;
            }
            .progress-step {
              width: 100px; /* Even smaller for very small screens */
              padding: 0.4rem;
            }
            .step-number {
              width: 30px;
              height: 30px;
              font-size: 1rem;
            }
            .step-title {
              font-size: 0.9rem;
            }
            .step-description {
              font-size: 0.7rem;
            }
            .form-content-area {
              padding: 1rem;
            }
            .project-summary-card {
              padding: 1rem;
            }
            .project-title {
              font-size: 1.5rem;
            }
            .project-meta {
              font-size: 0.8rem;
            }
            .investment-security-notice {
              padding: 0.75rem 1rem;
              font-size: 0.8rem;
              margin-top: 1rem;
            }
          }
        `}
      </style>

      {/* Investor Navbar */}
      <nav className="investor-navbar">
        <div className="investor-logo">💰 VillageFund</div>
        <div className="investor-nav-links">
          <Link to="/investor/dashboard">Dashboard</Link>
          <Link to="/investor/my-investments">My Investments</Link>
          <Link to="/investor/profile">Profile</Link>
          <button className="logout-btn" onClick={() => navigate('/')}>Logout</button> {/* Added onClick for logout */}
        </div>
      </nav>

      <div className="investment-form-wrapper">
        {/* Progress Sidebar */}
        <div className="form-progress-sidebar">
          <div
            className={`progress-step ${activeSection === 'amount' ? 'active' : ''}`}
            onClick={() => setActiveSection('amount')}
          >
            <div className="step-number">1</div>
            <div className="step-info">
              <div className="step-title">Investment Amount</div>
              <div className="step-description">Set your contribution</div>
            </div>
          </div>
          <div
            className={`progress-step ${activeSection === 'bank' ? 'active' : ''}`}
            onClick={() => setActiveSection('bank')}
          >
            <div className="step-number">2</div>
            <div className="step-info">
              <div className="step-title">Bank Details</div>
              <div className="step-description">Payment information</div>
            </div>
          </div>
          <div
            className={`progress-step ${activeSection === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSection('personal')}
          >
            <div className="step-number">3</div>
            <div className="step-info">
              <div className="step-title">Personal Details</div>
              <div className="step-description">KYC information</div>
            </div>
          </div>
          <div
            className={`progress-step ${activeSection === 'review' ? 'active' : ''}`}
            onClick={() => setActiveSection('review')}
          >
            <div className="step-number">4</div>
            <div className="step-info">
              <div className="step-title">Review & Submit</div>
              <div className="step-description">Confirm your investment</div>
            </div>
          </div>
        </div>

        {/* Form Content Area */}
        <div className="form-content-area">
          {/* Project Summary Card */}
          <div className="project-summary-card">
            <h2 className="project-title">{project.title}</h2>
            <div className="project-meta">
              <span className="location-badge">
                <i className="fas fa-map-marker-alt"></i> {project.location}
              </span>
              <span className="amount-badge">
                <i className="fas fa-rupee-sign"></i> {project.amount.toLocaleString()} needed
              </span>
              <span className="priority-badge">
                <i className="fas fa-exclamation-circle"></i> {project.priority} priority
              </span>
            </div>
            <p className="project-description">{project.description}</p>
            <div className="project-deadline">
              <i className="far fa-clock"></i> Deadline: {new Date(project.deadline).toLocaleDateString()}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="investment-form">
            {/* Investment Amount Section */}
            <div className={`form-section ${activeSection === 'amount' ? 'active' : ''}`}>
              <div className="section-header">
                <div className="section-number">1</div>
                <h3>Investment Amount</h3>
              </div>

              <div className="form-group">
                <label htmlFor="amount">How much would you like to invest? *</label>
                <div className="input-with-icon">
                  <i className="fas fa-rupee-sign"></i>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={investmentData.amount}
                    onChange={handleInputChange}
                    placeholder="Enter amount in INR"
                    min="1000"
                    max={project.amount}
                    className={errors.amount ? 'error' : ''}
                  />
                </div>
                {errors.amount && <span className="error-message">{errors.amount}</span>}
                <div className="amount-slider">
                  <input
                    type="range"
                    min="1000"
                    max={project.amount}
                    step="1000"
                    value={investmentData.amount || 0}
                    onChange={(e) => setInvestmentData({ ...investmentData, amount: e.target.value })}
                  />
                  <div className="slider-labels">
                    <span>₹1,000</span>
                    <span>₹{Math.floor(project.amount / 2).toLocaleString()}</span>
                    <span>₹{project.amount.toLocaleString()}</span>
                  </div>
                </div>
                <div className="investment-tip">
                  <i className="fas fa-lightbulb"></i> The minimum investment amount is ₹1,000
                </div>
              </div>

              <div className="form-navigation">
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => {
                    if (!investmentData.amount || parseFloat(investmentData.amount) <= 0 || (project && parseFloat(investmentData.amount) > project.amount)) {
                      setErrors(prev => ({ ...prev, amount: 'Investment amount is required and must be positive.' }));
                      showMessage('Please enter a valid investment amount.');
                    } else {
                      setActiveSection('bank');
                    }
                  }}
                >
                  Continue to Bank Details <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Bank Details Section */}
            <div className={`form-section ${activeSection === 'bank' ? 'active' : ''}`}>
              <div className="section-header">
                <div className="section-number">2</div>
                <h3>Bank Account Details</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bankAccountNumber">Bank Account Number *</label>
                  <div className="input-with-icon">
                    <i className="fas fa-credit-card"></i>
                    <input
                      id="bankAccountNumber"
                      type="text"
                      name="bankAccountNumber"
                      value={investmentData.bankAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter account number"
                      className={errors.bankAccountNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.bankAccountNumber && <span className="error-message">{errors.bankAccountNumber}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="accountHolderName">Account Holder Name *</label>
                  <div className="input-with-icon">
                    <i className="fas fa-user"></i>
                    <input
                      id="accountHolderName"
                      type="text"
                      name="accountHolderName"
                      value={investmentData.accountHolderName}
                      onChange={handleInputChange}
                      placeholder="As per bank records"
                      className={errors.accountHolderName ? 'error' : ''}
                    />
                  </div>
                  {errors.accountHolderName && <span className="error-message">{errors.accountHolderName}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="bankName">Bank Name *</label>
                  <div className="input-with-icon">
                    <i className="fas fa-university"></i>
                    <input
                      id="bankName"
                      type="text"
                      name="bankName"
                      value={investmentData.bankName}
                      onChange={handleInputChange}
                      placeholder="Enter bank name"
                      className={errors.bankName ? 'error' : ''}
                    />
                  </div>
                  {errors.bankName && <span className="error-message">{errors.bankName}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="bankBranch">Bank Branch</label>
                  <div className="input-with-icon">
                    <i className="fas fa-map-marker-alt"></i>
                    <input
                      id="bankBranch"
                      type="text"
                      name="bankBranch"
                      value={investmentData.bankBranch}
                      onChange={handleInputChange}
                      placeholder="Enter branch location"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="ifscCode">IFSC Code *</label>
                <div className="input-with-icon">
                  <i className="fas fa-code"></i>
                  <input
                    id="ifscCode"
                    type="text"
                    name="ifscCode"
                    value={investmentData.ifscCode}
                    onChange={handleInputChange}
                    placeholder="11 character code"
                    maxLength="11"
                    style={{ textTransform: 'uppercase' }}
                    className={errors.ifscCode ? 'error' : ''}
                  />
                </div>
                {errors.ifscCode && <span className="error-message">{errors.ifscCode}</span>}
                <div className="form-hint">
                  <i className="fas fa-info-circle"></i> You can find IFSC code on your cheque book or bank statement
                </div>
              </div>

              <div className="form-navigation">
                <button
                  type="button"
                  className="btn-prev"
                  onClick={() => setActiveSection('amount')}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => {
                    if (!investmentData.bankAccountNumber ||
                        !investmentData.accountHolderName ||
                        !investmentData.bankName ||
                        !investmentData.ifscCode ||
                        errors.bankAccountNumber ||
                        errors.accountHolderName ||
                        errors.bankName ||
                        errors.ifscCode) {
                      validateForm(); // Re-validate to show all errors
                      showMessage('Please fill in all required bank details correctly.');
                    } else {
                      setActiveSection('personal');
                    }
                  }}
                >
                  Continue to Personal Details <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Personal Details Section */}
            <div className={`form-section ${activeSection === 'personal' ? 'active' : ''}`}>
              <div className="section-header">
                <div className="section-number">3</div>
                <h3>Personal Information</h3>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="panNumber">PAN Number *</label>
                  <div className="input-with-icon">
                    <i className="fas fa-id-card"></i>
                    <input
                      id="panNumber"
                      type="text"
                      name="panNumber"
                      value={investmentData.panNumber}
                      onChange={handleInputChange}
                      placeholder="10 character PAN"
                      maxLength="10"
                      style={{ textTransform: 'uppercase' }}
                      className={errors.panNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.panNumber && <span className="error-message">{errors.panNumber}</span>}
                  <div className="form-hint">
                    <i className="fas fa-info-circle"></i> PAN is required for all investments
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="aadharNumber">Aadhar Number *</label>
                  <div className="input-with-icon">
                    <i className="fas fa-address-card"></i>
                    <input
                      id="aadharNumber"
                      type="text"
                      name="aadharNumber"
                      value={investmentData.aadharNumber}
                      onChange={handleInputChange}
                      placeholder="12 digit number"
                      maxLength="12"
                      className={errors.aadharNumber ? 'error' : ''}
                    />
                  </div>
                  {errors.aadharNumber && <span className="error-message">{errors.aadharNumber}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="investmentReason">Why are you investing in this project? (Optional)</label>
                <textarea
                  id="investmentReason"
                  name="investmentReason"
                  value={investmentData.investmentReason}
                  onChange={handleInputChange}
                  placeholder="Your motivation helps us understand our investors better..."
                  rows="3"
                />
              </div>

              <div className="form-navigation">
                <button
                  type="button"
                  className="btn-prev"
                  onClick={() => setActiveSection('bank')}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="button"
                  className="btn-next"
                  onClick={() => {
                    if (!investmentData.panNumber ||
                        !investmentData.aadharNumber ||
                        errors.panNumber ||
                        errors.aadharNumber) {
                      validateForm(); // Re-validate to show all errors
                      showMessage('Please fill in all required personal details correctly.');
                    } else {
                      setActiveSection('review');
                    }
                  }}
                >
                  Review Investment <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>

            {/* Review Section */}
            <div className={`form-section ${activeSection === 'review' ? 'active' : ''}`}>
              <div className="section-header">
                <div className="section-number">4</div>
                <h3>Review Your Investment</h3>
              </div>

              <div className="review-summary">
                <div className="summary-card">
                  <h4>Investment Summary</h4>
                  <div className="summary-item">
                    <span>Project:</span>
                    <strong>{project.title}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Amount:</span>
                    <strong>₹{parseFloat(investmentData.amount || 0).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="summary-card">
                  <h4>Bank Details</h4>
                  <div className="summary-item">
                    <span>Account Holder:</span>
                    <strong>{investmentData.accountHolderName || 'N/A'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Account Number:</span>
                    <strong>{investmentData.bankAccountNumber || 'N/A'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Bank:</span>
                    <strong>{investmentData.bankName || 'N/A'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>IFSC Code:</span>
                    <strong>{investmentData.ifscCode || 'N/A'}</strong>
                  </div>
                </div>

                <div className="summary-card">
                  <h4>Personal Details</h4>
                  <div className="summary-item">
                    <span>PAN:</span>
                    <strong>{investmentData.panNumber || 'N/A'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Aadhar:</span>
                    <strong>{investmentData.aadharNumber || 'N/A'}</strong>
                  </div>
                </div>
              </div>

              <div className="terms-agreement">
                <input type="checkbox" id="terms-agree" required />
                <label htmlFor="terms-agree">
                  I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a> and confirm that all details provided are accurate
                </label>
              </div>

              <div className="form-navigation">
                <button
                  type="button"
                  className="btn-prev"
                  onClick={() => setActiveSection('personal')}
                >
                  <i className="fas fa-arrow-left"></i> Back
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle"></i> Submit Investment
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Security Notice */}
      <div className="investment-security-notice">
        <i className="fas fa-lock"></i> Your information is securely encrypted and protected
      </div>

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
    </div>
  );
};

export default InvestmentForm;
