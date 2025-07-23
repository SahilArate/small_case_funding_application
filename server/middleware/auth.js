// middleware/auth.js
const jwt = require('jsonwebtoken'); // You'll need to install 'jsonwebtoken' if you haven't already
// npm install jsonwebtoken

// Assuming you have a JWT secret key.
// IMPORTANT: Replace 'YOUR_JWT_SECRET_KEY' with a strong, secret key.
// You should ideally store this in environment variables (e.g., process.env.JWT_SECRET)
const JWT_SECRET = 'YOUR_JWT_SECRET_KEY'; 

const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Extract the token (remove "Bearer " prefix)
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Token format is "Bearer <token>"' });
  }
  const actualToken = tokenParts[1];

  // Verify token
  try {
    const decoded = jwt.verify(actualToken, JWT_SECRET);
    req.user = decoded.user; // Attach the decoded user payload to the request object
    next(); // Proceed to the next middleware/route handler
  } catch (err) {
    console.error('Token verification error:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Middleware to check if the user is an owner
const isOwner = (req, res, next) => {
  // Assuming your decoded JWT contains a 'role' or 'userType' field
  // and that 'owner' is the role for project owners.
  // Adjust 'req.user.role' based on your actual JWT payload structure.
  if (req.user && req.user.role === 'owner') { // Example: if your JWT payload has { user: { id: '...', role: 'owner' } }
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Not an owner' });
  }
};

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  // Assuming your decoded JWT contains a 'role' or 'userType' field
  // and that 'admin' is the role for administrators.
  // Adjust 'req.user.role' based on your actual JWT payload structure.
  if (req.user && req.user.role === 'admin') { // Example: if your JWT payload has { user: { id: '...', role: 'admin' } }
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Not an admin' });
  }
};


module.exports = { auth, isOwner, isAdmin, JWT_SECRET };
