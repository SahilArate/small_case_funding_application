// client/src/pages/UserSignup.js
import React, { useState } from 'react';
import './Signup.css';

function UserSignup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Signup successful!');
        setFormData({ name: '', email: '', password: '' });
      } else {
        alert(result.error || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('An error occurred during signup.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Project Owner Signup</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}

export default UserSignup;
