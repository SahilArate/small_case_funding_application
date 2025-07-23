import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simple admin authentication (in production, use proper authentication)
    if (credentials.username === 'admin' && credentials.password === 'admin123') {
      localStorage.setItem('adminToken', 'admin-authenticated');
      alert('Welcome Admin! 👋');
      navigate('/admin/dashboard');
    } else {
      alert('Invalid admin credentials');
    }
    
    setLoading(false);
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-form">
        <h1 className="admin-title">🔐 Admin Login</h1>
        <form onSubmit={handleSubmit}>
          <label>Admin Username</label>
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            required
            placeholder="Enter admin username"
          />

          <label>Admin Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            placeholder="Enter admin password"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : '🚀 Login as Admin'}
          </button>
        </form>

        <div className="admin-demo-info">
          <p><strong>Demo Credentials:</strong></p>
          <p>Username: admin</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;