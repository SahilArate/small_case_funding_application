
const express = require('express');
const router = express.Router();
const Investor = require('../models/Investor');


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const investor = await Investor.findOne({ email });
    if (!investor || investor.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({ 
      message: 'Login successful', 
      user: { 
        id: investor._id, 
        email: investor.email, 
        role: 'owner' 
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// POST /api/investors/create
router.post('/create', async (req, res) => {
  try {
    const { email, password, occupation } = req.body;

    const existing = await Investor.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const investor = new Investor({ email, password, occupation });
    await investor.save();
    res.status(201).json({ message: 'Investor created successfully' });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
