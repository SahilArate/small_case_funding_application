const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const userRoutes = require('./routes/userRoutes');
const investorRoutes = require('./routes/investors');
const projectRoutes = require("./routes/projectRoutes");
const investmentRoutes = require('./routes/investmentRoutes');
const contactRoutes = require("./routes/contactRoutes");

require('dotenv').config(); // This line loads variables from your .env file

const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware - ORDER MATTERS!
app.use(cors({
  origin: ['http://localhost', 'http://frontend'], // Allow access from host (localhost) and Docker's frontend service name
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Added for form data

// Static file serving

app.use('/api/investments', investmentRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/investors', investorRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/contact", contactRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({ 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Connect to MongoDB
// This line uses the MONGO_URI from your .env file first, or falls back to local
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/funding-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
  process.exit(1);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});