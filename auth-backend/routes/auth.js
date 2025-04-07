const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      userType: user.userType 
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
};

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType, phoneNumber, major, year, bio } = req.body;

    // Basic validation
    if (!name || !email || !password || !userType || !phoneNumber) {
      return res.status(400).json({ 
        success: false,
        msg: 'Please provide all required fields',
        missing: {
          name: !name,
          email: !email,
          password: !password,
          userType: !userType,
          phoneNumber: !phoneNumber
        }
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        msg: 'Email already registered' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      userType: userType.toLowerCase(),
      phoneNumber,
      major,
      year,
      bio
    });

    // Save user
    const savedUser = await newUser.save();

    // Generate token
    const token = generateToken(savedUser);

    // Return success response
    res.status(201).json({
      success: true,
      msg: 'User created successfully',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        userType: savedUser.userType
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        msg: 'Validation error',
        errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: 'Email already registered'
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: error.message
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        msg: 'Please provide email and password'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return success response
    res.json({
      success: true,
      msg: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      msg: 'Server error',
      error: error.message
    });
  }
});

module.exports = router; 