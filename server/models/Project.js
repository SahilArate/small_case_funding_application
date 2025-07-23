
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  amount: { // This is the total amount requested for the project
    type: Number,
    required: [true, 'Project amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  amountFunded: { // Amount actually invested/funded for this project
    type: Number,
    default: 0
  },
  location: {
    type: String,
    required: [true, 'Project location is required'],
    trim: true
  },
  deadline: {
    type: Date,
    required: [true, 'Project deadline is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Deadline must be in the future'
    }
  },
  status: { // Project's overall status (e.g., Pending, In Progress, Approved, Completed)
    type: String,
    enum: ['Pending', 'In Progress', 'Approved', 'Completed'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  engineer: {
    type: String,
    trim: true
  },
  document: {
    type: String, // path to uploaded file
    default: null
  },
  // Owner information
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Owner ID is required']
  },
  // Admin-related fields (for project approval, separate from funding)
  adminStatus: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: {
    type: String,
    default: null
  },
  adminReviewedAt: {
    type: Date,
    default: null
  },
  adminReviewedBy: {
    type: String,
    default: 'Admin'
  },
  // Field for owner's overall fund utilization notes (existing)
  fundUtilizationNotes: {
    type: String,
    default: ''
  },
  // NEW: Array to store detailed fund utilization entries
  fundUtilizationDetails: [
    {
      amount: { type: Number, required: true, min: 0 },
      description: { type: String, required: true, trim: true },
      date: { type: Date, default: Date.now }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Project", projectSchema);
