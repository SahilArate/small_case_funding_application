const mongoose = require('mongoose');

const InvestorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  occupation: { type: String, required: true }
});

module.exports = mongoose.model('Investor', InvestorSchema);
