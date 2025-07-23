// src/pages/UserLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

function UserLogin() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('🔐 =================================');
      console.log('🔐 LOGIN PROCESS STARTED');
      console.log('🔐 =================================');
      console.log('📧 Attempting login with email:', formData.email);
      
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📨 Raw login response:', result);
      
      if (!result.user) {
        throw new Error('Login successful but no user data received.');
      }

      const userData = {
        id: result.user.id || result.user._id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone || '',
        address: result.user.address || '',
        occupation: result.user.occupation || '',
        createdAt: result.user.createdAt
      };

      if (!userData.id) throw new Error('No user ID received from backend after successful login.');

      // Store user in localStorage
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('📦 User data saved to localStorage:', userData);

      // Also set a global window variable for immediate access (for debugging/fallback)
      window.currentUser = userData; 
      console.log('🌐 window.currentUser set:', window.currentUser);

      alert(`Welcome ${userData.name}!`);

      // ✅ CHANGE THIS LINE: Navigate to Owner Dashboard
      navigate('/owner/dashboard', { state: { currentUser: userData } });

    } catch (error) {
      alert(error.message);
      console.error('Login Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debugging panel for Docker environment
  const debugStorage = () => {
    console.log('--- Debugging Storage ---');
    console.log('localStorage "user":', localStorage.getItem('user'));
    try {
      const parsedUser = JSON.parse(localStorage.getItem('user'));
      console.log('Parsed localStorage "user":', parsedUser);
      console.log('Parsed localStorage "user" ID:', parsedUser?.id);
    } catch (e) {
      console.error('Error parsing localStorage "user":', e);
    }
    console.log('sessionStorage "user":', sessionStorage.getItem('user'));
    console.log('window.currentUser:', window.currentUser);
    console.log('--- End Debugging Storage ---');
    alert('Check console for storage debug info!');
  };

  const testNavigation = () => {
    const storedUser = localStorage.getItem('user');
    let user = null;
    try {
      user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage for test navigation:", e);
    }
    if (user && user.id) {
      navigate('/owner/add-project', { state: { currentUser: user } });
    } else {
      alert('No user found in storage to test navigation. Please log in first.');
    }
  };


  return (
    <div className="signup-container">
      <h2>Project Owner Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Docker Environment Debug Panel */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        backgroundColor: '#f9f9f9',
        fontSize: '12px',
        color: '#555'
      }}>
        <strong>🐳 Docker Environment Debug Panel</strong>
        <br />
        <div style={{ margin: '10px 0' }}>
          <button 
            type="button" 
            onClick={debugStorage}
            style={{ margin: '5px', padding: '8px 12px', fontSize: '11px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🔍 Check Storage
          </button>
          <button 
            type="button" 
            onClick={() => {
              localStorage.clear();
              sessionStorage.clear();
              window.currentUser = null;
              alert('✅ All storage cleared');
            }}
            style={{ margin: '5px', padding: '8px 12px', fontSize: '11px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🗑️ Clear Storage
          </button>
          <button 
            type="button" 
            onClick={testNavigation}
            style={{ margin: '5px', padding: '8px 12px', fontSize: '11px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            🧪 Test Add Project
          </button>
        </div>
        <small>
          Backend: http://localhost:5000 | 
          DB: MongoDB Atlas | 
          Container: Docker | 
          Storage: Multi-method (localStorage, navigation state, window.currentUser)
        </small>
      </div>
    </div>
  );
}

export default UserLogin;
