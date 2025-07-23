// src/components/InvestorProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './InvestorProfile.css';

const InvestorProfile = () => {
    const [investor, setInvestor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInvestorProfile = async () => {
            try {
                const userId = localStorage.getItem('userId'); 
                console.log('Retrieved userId from localStorage:', userId);

                if (!userId) {
                    console.log('No userId found in localStorage');
                    setError('User not logged in. Please log in again.');
                    setLoading(false);
                    // Redirect to login page after a short delay
                    setTimeout(() => navigate('/'), 2000);
                    return;
                }

                console.log('Fetching profile for userId:', userId);
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`); 
                console.log('Profile data received:', response.data);
                
                setInvestor(response.data);
                setError(''); // Clear any previous errors
            } catch (err) {
                console.error('Error fetching investor profile:', err);
                
                if (err.response) {
                    const status = err.response.status;
                    const errorMessage = err.response.data.error || 'Failed to load profile';
                    
                    console.error('Server error:', status, errorMessage);
                    
                    if (status === 404) {
                        setError('User profile not found. Please log in again.');
                        localStorage.removeItem('userId');
                        setTimeout(() => navigate('/'), 2000);
                    } else if (status === 400) {
                        setError('Invalid user ID. Please log in again.');
                        localStorage.removeItem('userId');
                        setTimeout(() => navigate('/'), 2000);
                    } else {
                        setError(errorMessage);
                    }
                } else if (err.request) {
                    setError('Unable to connect to server. Please check your connection.');
                } else {
                    setError('An unexpected error occurred. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchInvestorProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="investor-profile-container">
                <div className="profile-loading">
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '2rem', marginBottom: '1rem'}}>⏳</div>
                        <div>Loading your profile...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="investor-profile-container">
                <nav className="investor-navbar">
                    <div className="investor-logo">👤 Investor Profile</div>
                    <div className="investor-nav-links">
                        <Link to="/investor/dashboard">Dashboard</Link>
                        <Link to="/investor/investments">My Investments</Link>
                        <button 
                            onClick={handleLogout}
                            style={{
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer',
                                color: '#4a5568',
                                fontWeight: '500',
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Logout
                        </button>
                    </div>
                </nav>
                <div className="profile-error">
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>❌</div>
                        <div style={{fontSize: '1.5rem', marginBottom: '1rem'}}>{error}</div>
                        <button 
                            onClick={() => navigate('/')}
                            style={{
                                padding: '0.8rem 1.5rem',
                                backgroundColor: '#667eea',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: '600'
                            }}
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!investor) {
        return (
            <div className="investor-profile-container">
                <div className="profile-no-data">
                    <div style={{textAlign: 'center'}}>
                        <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔍</div>
                        <div>No profile data found</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="investor-profile-container">
            <nav className="investor-navbar">
                <div className="investor-logo">👤 Investor Profile</div>
                <div className="investor-nav-links">
                    <Link to="/investor/dashboard">Dashboard</Link>
                    <Link to="/investor/investments">My Investments</Link>
                    <button 
                        onClick={handleLogout}
                        style={{
                            background: 'none', 
                            border: 'none', 
                            cursor: 'pointer',
                            color: '#4a5568',
                            fontWeight: '500',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.background = 'linear-gradient(45deg, #667eea, #764ba2)';
                            e.target.style.color = 'white';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.color = '#4a5568';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <main className="profile-content">
                <h1 className="profile-welcome">Your Profile Details 👋</h1>

                <div className="profile-card">
                    <div className="profile-avatar">
                        {investor.name ? investor.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h2>{investor.name}</h2>
                    <p className="profile-tagline">Proud Investor in Village Development</p>

                    <div className="profile-details-grid">
                        <div className="detail-item">
                            <strong>📧 Email:</strong>
                            <span>{investor.email}</span>
                        </div>
                        <div className="detail-item">
                            <strong>🆔 User ID:</strong>
                            {/* ✅ FIX: Change _id to id */}
                            <span>{investor.id}</span> 
                        </div>
                        <div className="detail-item">
                            <strong>⏰ Member Since:</strong>
                            <span>{new Date(investor.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button className="edit-profile-btn">✏️ Edit Profile</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default InvestorProfile;
