
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.post('/create', async (req, res) => {
    try {
        console.log("Request body:", req.body);

        const { name, email, password, phone, address, occupation } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Please provide all required fields (name, email, password).' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword,
            phone: phone || null,
            address: address || null,
            occupation: occupation || null
        });
        await newUser.save();

        res.status(201).json({ message: 'Account created successfully!' });

    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: 'Server error. Please try again later.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('🔐 Login attempt for email:', email);
        
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            console.log('❌ User not found for email:', email);
            return res.status(404).json({ error: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, existingUser.password);

        if (!isMatch) {
            console.log('❌ Invalid password for email:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const userResponse = {
            id: existingUser._id.toString(), 
            name: existingUser.name,
            email: existingUser.email,
            phone: existingUser.phone,
            address: existingUser.address,
            occupation: existingUser.occupation,
            createdAt: existingUser.createdAt
        };

        console.log('✅ Login successful for user:', userResponse.name);
        console.log('👤 User ID being sent:', userResponse.id);

        res.status(200).json({
            message: 'Login successful',
            user: userResponse
        });
        
    } catch (error) {
        console.error('💥 Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        console.log(`🔍 Fetching user with ID: ${userId}`);

        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            console.log('❌ Invalid MongoDB ObjectId format:', userId);
            return res.status(400).json({ error: 'Invalid user ID format.' });
        }

        const user = await User.findById(userId).select('-password');

        if (!user) {
            console.log(`❌ User with ID ${userId} not found.`);
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            occupation: user.occupation,
            createdAt: user.createdAt
        };

        console.log('✅ User found:', userResponse.name);
        res.status(200).json(userResponse);
        
    } catch (error) {
        console.error('💥 Error fetching user by ID:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format.' });
        }
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;