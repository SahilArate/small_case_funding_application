const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  queryType: {
    type: String,
    required: true,
    enum: ['general', 'technical', 'project', 'payment', 'feedback', 'other'],
    default: 'general'
  },
  message: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'in-progress', 'resolved'],
    default: 'new'
  },
  userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false,
  default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  }
});

module.exports = mongoose.model('Contact', ContactSchema);