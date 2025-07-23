// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './InvestorLogin.css'; // You'll need to create this CSS file

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login with:', { email, password: '***' });
            
            const response = await axios.post('http://localhost:5000/api/users/login', {
                email,
                password
            });

            console.log('Login response:', response.data);

            if (response.status === 200) {
                // Store user data in localStorage - THIS IS THE KEY FIX!
                localStorage.setItem('userId', response.data.user.id);
                localStorage.setItem('userName', response.data.user.name);
                localStorage.setItem('userEmail', response.data.user.email);
                
                console.log('Stored userId in localStorage:', response.data.user.id);
                
                // Navigate to investor dashboard
                navigate('/investor/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            if (error.response) {
                setError(error.response.data.error || 'Login failed');
            } else if (error.request) {
                setError('Unable to connect to server. Please try again.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back</h2>
                <p>Sign in to your investor account</p>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;