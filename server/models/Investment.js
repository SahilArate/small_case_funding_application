const mongoose = require('mongoose');

const InvestmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  bankDetails: {
    accountNumber: { type: String, required: true },
    bankName: { type: String, required: true },
    bankBranch: { type: String },
    ifscCode: { type: String, required: true },
    accountHolderName: { type: String, required: true }
  },
  personalDetails: {
    panNumber: { type: String, required: true },
    aadharNumber: { type: String, required: true }
  },
  investmentReason: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: { type: String },
  adminApprovedAt: { type: Date },
  adminApprovedBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Investment', InvestmentSchema);