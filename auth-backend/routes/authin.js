const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to check MongoDB connection
const checkMongoConnection = () => {
  return mongoose.connection.readyState === 1;
};

// Sign up
router.post('/signup', async (req, res) => {
  const { name, email, password, userType, phoneNumber, major, year, bio } = req.body;

  if (!name || !email || !password || !userType || !phoneNumber) {
    return res.status(400).json({ msg: 'Please fill all required fields' });
  }

  if (!['blind', 'volunteer'].includes(userType)) {
    return res.status(400).json({ msg: 'Invalid user type' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ msg: 'Invalid email format' });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email }).maxTimeMS(5000);
    if (existingUser) {
      return res.status(400).json({ msg: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hash,
      userType,
      phoneNumber,
      major,
      year,
      bio,
    });

    await newUser.save();
    res.status(201).json({ msg: 'User created successfully' });
  } catch (err) {
    console.error('Signup error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ msg: 'Validation error', error: err.message });
    }
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        msg: 'Database connection error', 
        error: 'Unable to connect to database. Please try again later.' 
      });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).maxTimeMS(5000);
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
      return res.status(503).json({ 
        msg: 'Database connection error', 
        error: 'Unable to connect to database. Please try again later.' 
      });
    }
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
