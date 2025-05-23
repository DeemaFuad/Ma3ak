const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, msg: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, msg: 'Invalid token' });
    req.user = user;
    next();
  });
}

// GET /api/profile - Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// PUT /api/profile - Update user profile
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, bio } = req.body;
    
    // Validate input
    if (!name || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Name and phone number are required' 
      });
    }

    // Only allow updating specific fields
    const updateData = {
      name,
      phoneNumber,
      bio: bio || ''
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ success: false, msg: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 