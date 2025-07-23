import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

// Define a set of vibrant colors for the charts
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

const InvestmentAnalysis = () => {
  const { projectId } = useParams(); // Get projectId from URL parameters
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [fundUsages, setFundUsages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for custom message modal
  const [message, setMessage] = useState('');
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  // State for full-screen image modal
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

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

  // Function to open full-screen image modal
  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsImageModalOpen(true);
  };

  // Function to close full-screen image modal
  const closeImageModal = () => {
    setSelectedImage(null);
    setIsImageModalOpen(false);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project details
      const projectResponse = await axios.get(`http://localhost:5000/api/projects/project/${projectId}`);
      setProject(projectResponse.data);

      // Fetch fund usages for this project
      const fundUsageResponse = await axios.get(`http://localhost:5000/api/fund-usage/project/${projectId}`);
      setFundUsages(fundUsageResponse.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load analysis data. Please try again.');
      showMessageModal('Failed to load analysis data. Please try again.');
      // Optionally navigate back to my investments or dashboard on critical error
      navigate('/investor/my-investments');
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Aggregate data for Pie Chart (funds used by category)
  const dataForPieChart = Object.values(
    fundUsages.reduce((acc, usage) => {
      acc[usage.category] = acc[usage.category] || { name: usage.category, value: 0 };
      acc[usage.category].value += usage.amountUsed;
      return acc;
    }, {})
  );

  // Aggregate data for Bar Chart (funds used over time, grouped by month/year)
  const dataForBarChart = Object.values(
    fundUsages.reduce((acc, usage) => {
      const date = new Date(usage.dateUsed);
      // Format as "Mon-YYYY" for better readability on X-axis
      const monthYear = `${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
      acc[monthYear] = acc[monthYear] || { name: monthYear, 'Amount Spent': 0 };
      acc[monthYear]['Amount Spent'] += usage.amountUsed;
      return acc;
    }, {})
  ).sort((a, b) => new Date(a.name) - new Date(b.name)); // Sort chronologically

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading investment analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="investor-dashboard-container"> {/* Reusing dashboard container styles */}
        <nav className="investor-navbar">
          <div className="investor-logo">💰 VillageFund</div>
          <div className="investor-nav-links">
            <Link to="/investor/dashboard">Dashboard</Link>
            <Link to="/investor/my-investments">My Investments</Link>
            <Link to="/investor/profile">Profile</Link>
            <button onClick={() => navigate('/')} className="logout-btn">Logout</button>
          </div>
        </nav>
        <div className="investor-content">
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '15px',
            textAlign: 'center',
            color: '#e74c3c',
            marginTop: '2rem'
          }}>
            <h2>❌ Error Loading Data</h2>
            <p>{error}</p>
            <button
              onClick={fetchData}
              style={{
                background: '#667eea',
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

  // Calculate total spent and percentage
  const totalSpent = fundUsages.reduce((sum, usage) => sum + usage.amountUsed, 0);
  // Use initialAmount if available, otherwise fallback to current amount (less accurate for total goal)
  const initialAmount = project?.initialAmount || project?.amount;
  const percentageSpent = initialAmount > 0 ? (totalSpent / initialAmount * 100).toFixed(2) : 0;

  return (
    <div className="investment-analysis-container">
      {/* Font Awesome CDN for icons */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />

      {/* Recharts library for charts (already included in the environment, but good to note) */}
      {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.1.8/recharts.min.js"></script> */}

      {/* Embedded CSS for Investment Analysis Page */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

          .investment-analysis-container {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            font-family: 'Inter', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-bottom: 3rem;
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

          /* Main Content Wrapper */
          .analysis-wrapper {
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(15px);
            border-radius: 25px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.3);
            margin: 3rem auto;
            max-width: 1200px;
            width: 95%;
            padding: 2.5rem;
            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .analysis-header {
            text-align: center;
            color: #2d3748;
            font-size: 2.5rem;
            margin-bottom: 1rem;
            background: linear-gradient(45deg, #667eea, #764ba2);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .project-summary-analysis {
            background: #f7fafc;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            text-align: center;
            margin-bottom: 2rem;
          }

          .project-summary-analysis h3 {
            font-size: 1.8rem;
            color: #2d3748;
            margin-bottom: 0.8rem;
          }

          .project-summary-analysis p {
            font-size: 1.1rem;
            color: #4a5568;
            margin-bottom: 0.5rem;
          }

          .project-summary-analysis .amount-info {
            font-size: 1.5rem;
            font-weight: 600;
            color: #764ba2;
          }

          .project-summary-analysis .progress-bar-container {
            width: 80%;
            margin: 1.5rem auto 0.5rem;
            background-color: #e2e8f0;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
          }

          .project-summary-analysis .progress-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #48bb78, #38a169);
            border-radius: 10px;
            transition: width 0.5s ease-out;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 0.9rem;
          }

          .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .chart-card {
            background: #f7fafc;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
            height: 400px; /* Fixed height for charts */
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .chart-card h4 {
            color: #2d3748;
            font-size: 1.4rem;
            margin-bottom: 1rem;
            text-align: center;
          }

          .chart-container {
            width: 100%;
            height: 100%;
          }

          /* Fund Usage List */
          .fund-usage-list {
            background: #f7fafc;
            border-radius: 15px;
            padding: 1.5rem;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
          }

          .fund-usage-list h4 {
            color: #2d3748;
            font-size: 1.6rem;
            margin-bottom: 1.5rem;
            text-align: center;
          }

          .usage-item {
            display: flex;
            flex-direction: column;
            background: #edf2f7;
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          }

          .usage-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.5rem;
          }

          .usage-header strong {
            font-size: 1.1rem;
            color: #2d3748;
          }

          .usage-header span {
            font-size: 0.9rem;
            color: #718096;
          }

          .usage-description {
            font-size: 0.95rem;
            color: #4a5568;
            margin-bottom: 0.8rem;
          }

          .usage-images {
            display: flex;
            flex-wrap: wrap;
            gap: 0.8rem;
            margin-top: 0.8rem;
          }

          .usage-image {
            width: 80px;
            height: 80px;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #cbd5e0;
            cursor: pointer;
            transition: transform 0.2s ease;
          }

          .usage-image:hover {
            transform: scale(1.05);
          }

          .no-usage-data {
            text-align: center;
            color: #718096;
            padding: 2rem;
            font-size: 1.1rem;
          }

          /* Image Modal */
          .image-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3000;
          }

          .image-modal-content {
            max-width: 90%;
            max-height: 90%;
            background: white;
            padding: 1rem;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            position: relative;
          }

          .image-modal-content img {
            max-width: 100%;
            max-height: 80vh;
            display: block;
            margin: 0 auto;
            border-radius: 10px;
          }

          .image-modal-close-btn {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.3);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            font-size: 1.5rem;
            cursor: pointer;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 3001;
          }

          .image-modal-close-btn:hover {
            background: rgba(255, 255, 255, 0.5);
          }


          /* Loading/Error Screens (from dashboard) */
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

          /* Custom Message Modal (from dashboard) */
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
            .analysis-wrapper {
              padding: 1.5rem;
            }
            .analysis-header {
              font-size: 2rem;
            }
            .charts-grid {
              grid-template-columns: 1fr;
              gap: 1.5rem;
            }
            .chart-card {
              height: 350px;
            }
          }

          @media (max-width: 768px) {
            .investor-navbar {
              flex-direction: column;
              gap: 1rem;
              padding: 1rem;
            }
            .investor-nav-links {
              gap: 1rem;
            }
            .analysis-wrapper {
              margin: 2rem auto;
              padding: 1.5rem;
            }
            .analysis-header {
              font-size: 1.8rem;
            }
            .project-summary-analysis {
              padding: 1rem;
            }
            .project-summary-analysis h3 {
              font-size: 1.5rem;
            }
            .chart-card {
              height: 300px;
            }
            .fund-usage-list {
              padding: 1rem;
            }
            .fund-usage-list h4 {
              font-size: 1.4rem;
            }
            .usage-item {
              padding: 0.8rem;
            }
            .usage-header strong {
              font-size: 1rem;
            }
          }

          @media (max-width: 480px) {
            .analysis-wrapper {
              margin: 1rem auto;
              padding: 1rem;
            }
            .analysis-header {
              font-size: 1.5rem;
            }
            .project-summary-analysis .progress-bar-container {
              width: 95%;
            }
            .chart-card {
              height: 250px;
            }
            .usage-image {
              width: 60px;
              height: 60px;
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
          <button onClick={() => navigate('/')} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="analysis-wrapper">
        <h1 className="analysis-header">Investment Analysis for "{project?.title || 'Project'}"</h1>

        <div className="project-summary-analysis">
          <h3>Project Funding Progress</h3>
          <p>
            Total Project Amount: <span className="amount-info">₹{project?.initialAmount?.toLocaleString() || project?.amount?.toLocaleString() || 'N/A'}</span>
          </p>
          <p>
            Amount Remaining: <span className="amount-info">₹{project?.amount?.toLocaleString() || 'N/A'}</span>
          </p>
          <p>
            Total Funds Utilized: <span className="amount-info">₹{totalSpent.toLocaleString()}</span>
          </p>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${percentageSpent > 100 ? 100 : percentageSpent}%` }}>
              {percentageSpent}% Utilized
            </div>
          </div>
        </div>

        {fundUsages.length > 0 ? (
          <>
            <div className="charts-grid">
              <div className="chart-card">
                <h4>Funds Used by Category</h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataForPieChart}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {dataForPieChart.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-card">
                <h4>Funds Used Over Time</h4>
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataForBarChart}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `₹${value.toLocaleString()}`} />
                      <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="Amount Spent" fill="#8884d8" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="fund-usage-list">
              <h4>Detailed Fund Usage</h4>
              {fundUsages.map(usage => (
                <div key={usage._id} className="usage-item">
                  <div className="usage-header">
                    <strong>₹{usage.amountUsed.toLocaleString()} ({usage.category})</strong>
                    <span>{new Date(usage.dateUsed).toLocaleDateString()}</span>
                  </div>
                  <p className="usage-description">{usage.description}</p>
                  {usage.images && usage.images.length > 0 && (
                    <div className="usage-images">
                      {usage.images.map((imagePath, index) => (
                        <img
                          key={index}
                          src={`http://localhost:5000/${imagePath}`} // Assuming images are served from /uploads
                          alt={`Usage evidence ${index + 1}`}
                          className="usage-image"
                          onClick={() => openImageModal(`http://localhost:5000/${imagePath}`)}
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/80x80/cccccc/000000?text=No+Image'; }} // Fallback
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="no-usage-data">
            <p>No fund usage details have been reported for this project yet.</p>
            <p>Check back later for updates!</p>
          </div>
        )}
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

      {/* Image Full-Screen Modal */}
      {isImageModalOpen && selectedImage && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevent closing when clicking image */}
            <button className="image-modal-close-btn" onClick={closeImageModal}>&times;</button>
            <img src={selectedImage} alt="Full size" />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentAnalysis;
