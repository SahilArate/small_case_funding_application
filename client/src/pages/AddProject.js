
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddProject.css';

const AddProject = () => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    amount: '',
    location: '',
    deadline: '',
    status: 'Pending',
    priority: 'Medium',
    engineer: '',
  });

  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(false); // For form submission
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true); // Tracks if user data is being loaded/checked
  const navigate = useNavigate();
  const location = useLocation();

  // Extensive debugging for user data retrieval
  useEffect(() => {
    console.log('🔍 =================================');
    console.log('🔍 DEBUGGING USER DATA RETRIEVAL FOR ADD PROJECT');
    console.log('🔍 =================================');
    
    const debugData = {
      localStorage: null,
      sessionStorage: null,
      windowObject: null,
      parsedLocalStorage: null,
      parsedSessionStorage: null,
      finalUser: null
    };

    let userFound = false;
    let userFromStorage = null;

    try {
      // Check localStorage raw data
      const localStorageRaw = localStorage.getItem('user');
      debugData.localStorage = localStorageRaw;
      console.log('📦 localStorage RAW:', localStorageRaw);
      
      // Check sessionStorage raw data (though not primarily used here)
      const sessionStorageRaw = sessionStorage.getItem('user');
      debugData.sessionStorage = sessionStorageRaw;
      console.log('📦 sessionStorage RAW:', sessionStorageRaw);

      // Check window.currentUser (set by UserLogin for immediate access)
      debugData.windowObject = window.currentUser;
      console.log('🌐 window.currentUser:', window.currentUser);

      // Attempt to parse localStorage
      if (localStorageRaw) {
        try {
          const parsed = JSON.parse(localStorageRaw);
          debugData.parsedLocalStorage = parsed;
          console.log('✅ Parsed localStorage "user":', parsed);
          if (parsed && parsed.id) {
            userFromStorage = parsed;
          } else {
            console.warn('⚠️ localStorage "user" found but ID is missing or malformed.');
          }
        } catch (e) {
          console.error('❌ Error parsing localStorage "user":', e);
        }
      }

      // Prioritize navigation state, then window.currentUser, then localStorage
      if (location.state && location.state.currentUser && location.state.currentUser.id) {
        setCurrentUser(location.state.currentUser);
        debugData.finalUser = location.state.currentUser;
        console.log('✅ User data from navigation state (highest priority):', location.state.currentUser);
        userFound = true;
      } else if (window.currentUser && window.currentUser.id) {
        setCurrentUser(window.currentUser);
        debugData.finalUser = window.currentUser;
        console.log('✅ User data from window.currentUser (fallback 1):', window.currentUser);
        userFound = true;
      } else if (userFromStorage && userFromStorage.id) {
        setCurrentUser(userFromStorage);
        debugData.finalUser = userFromStorage;
        console.log('✅ User data from localStorage (fallback 2):', userFromStorage);
        userFound = true;
      } else {
        console.error('❌ No valid user data found in navigation state, window.currentUser, or localStorage.');
      }

    } catch (err) {
      console.error('💥 AddProject: General error during user data retrieval:', err.message);
    } finally {
      setIsLoadingUser(false); // User data check complete
      console.log('🔍 Final debug info:', debugData);
      console.log('🔍 =================================');
    }
  }, [navigate, location.state]); // Add location.state to dependency array

  // Redirect if no user found after loading
  useEffect(() => {
    if (!isLoadingUser && (!currentUser || !currentUser.id)) {
      alert('Please login to create'); // Use alert for now as requested
      navigate('/login');
    }
  }, [isLoadingUser, currentUser, navigate]);


  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      setDocument(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Double-check currentUser before submission
    if (!currentUser || !currentUser.id) {
      alert('User session not found. Please login again.');
      navigate('/login'); // Redirect if somehow session is lost
      return;
    }

    const formData = new FormData();
    Object.entries(project).forEach(([key, val]) => formData.append(key, val));
    formData.append('ownerId', currentUser.id); // Use the currentUser.id
    if (document) formData.append('document', document);

    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/projects/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Project added successfully!');
      navigate('/owner/dashboard');
    } catch (err) {
      console.error('❌ Submission failed:', err);
      alert('Error adding project: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Render loading state while checking user
  if (isLoadingUser) {
    return <div className="add-container" style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#555' }}>Loading user session...</div>;
  }

  // Render login prompt if no user found after loading
  if (!currentUser || !currentUser.id) {
    return (
      <div className="add-container" style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#555' }}>
        <h2>Access Denied</h2>
        <p>You must be logged in as a Project Owner to add a project.</p>
        <button onClick={() => navigate('/login')} className="submit-btn" style={{ maxWidth: '200px', margin: '20px auto' }}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="add-container">
      <h1>Add New Project</h1>
      <form className="add-form" onSubmit={handleSubmit}>
        <label>Project Title</label>
        <input name="title" value={project.title} onChange={handleChange} required placeholder="Enter project title" disabled={loading} />
        
        <label>Description</label>
        <textarea name="description" value={project.description} onChange={handleChange} required placeholder="Describe your project" disabled={loading} />
        
        <label>Amount Requested (₹)</label>
        <input type="number" name="amount" value={project.amount} onChange={handleChange} required placeholder="Enter amount (e.g., 100000)" disabled={loading} />
        
        <label>Location</label>
        <input name="location" value={project.location} onChange={handleChange} required placeholder="Project location (e.g., Village Name, District)" disabled={loading} />
        
        <label>Deadline</label>
        <input type="date" name="deadline" value={project.deadline} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} disabled={loading} />
        
        <label>Status</label>
        <select name="status" value={project.status} onChange={handleChange} disabled={loading}>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Approved">Approved</option>
          <option value="Completed">Completed</option>
        </select>
        
        <label>Priority</label>
        <select name="priority" value={project.priority} onChange={handleChange} disabled={loading}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        
        <label>Assigned Engineer</label>
        <input name="engineer" value={project.engineer} onChange={handleChange} placeholder="Engineer name (optional)" disabled={loading} />
        
        <label>Upload Document (PDF, DOCX, JPG/PNG) - Max 5MB</label>
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          disabled={loading}
        />
        {document && (
          <p className="file-info">
            Selected: {document.name} ({(document.size / 1024 / 1024).toFixed(2)} MB)
          </p>
        )}
        
        <button 
          type="submit" 
          className="submit-btn" 
          disabled={loading || !currentUser?.id}
        >
          {loading ? '⏳ Adding Project...' : '🚀 Add Project'}
        </button>
      </form>
    </div>
  );
};

export default AddProject;
