const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// POST /api/contact - Submit contact form
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, queryType, message } = req.body;

    if (!name || !email || !message || !queryType) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const newContact = new Contact({
      name,
      email,
      phone,
      queryType,
      message
    });

    await newContact.save();
    res.status(201).json({ message: 'Contact form submitted successfully!' });

  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

module.exports = router;