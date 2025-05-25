const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Request = require('../models/Request');

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

// POST /auth/requests - Create a new assistance request
router.post('/requests', authenticateToken, async (req, res) => {
  try {
    console.log("Original request body:", JSON.stringify(req.body));
    
    const { assistanceType, description, location } = req.body;
    console.log("Extracted location:", JSON.stringify(location));
    
    if (!assistanceType) {
      return res.status(400).json({ success: false, msg: 'assistanceType is required' });
    }
    
    // Validate the location structure
    if (!location || !location.coordinates || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ success: false, msg: 'Valid location coordinates are required' });
    }
    
    // Only require description if assistanceType is 'Other'
    if (assistanceType === 'Other' && (!description || !description.trim())) {
      return res.status(400).json({ success: false, msg: 'Description is required when assistanceType is Other' });
    }
    
    // We don't need to transform the location since it's already in the right format
    
    console.log("Creating request with:", JSON.stringify({
      userId: req.user.id,
      assistanceType,
      description,
      location
    }));
    
    const newRequest = new Request({
      userId: req.user.id,
      assistanceType,
      description: description || "", // Handle undefined
      location: {
        type: location.type || 'Point',
        coordinates: location.coordinates
      }
    });
    
    console.log("Request model before save:", JSON.stringify(newRequest));
    
    const savedRequest = await newRequest.save();
    res.status(201).json({ success: true, request: savedRequest });
  } catch (error) {
    console.error('Request creation error:', error);
    res.status(500).json({ success: false, msg: 'Server error', error: error.message });
  }
});

// GET /auth/active-requests - Get user's active requests
router.get('/active-requests', authenticateToken, async (req, res) => {
  try {
    const activeRequests = await Request.find({
      userId: req.user.id,
      status: { $in: ['pending', 'attended'] }
    })
    .populate('assignedVolunteer', 'name phoneNumber')
    .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      requests: activeRequests 
    });
  } catch (error) {
    console.error('Error fetching active requests:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch active requests' 
    });
  }
});

// GET /auth/requests - Get all requests for the current user
router.get('/requests', authenticateToken, async (req, res) => {
  try {
    console.log('Fetching requests for user:', req.user.id);
    const requests = await Request.find({ userId: req.user.id })
      .populate('assignedVolunteer', 'name phoneNumber')
      .sort({ createdAt: -1 });

    console.log('Found requests:', requests);
    res.json({ 
      success: true, 
      requests 
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      success: false, 
      msg: 'Failed to fetch requests',
      error: error.message 
    });
  }
});

// PUT /auth/requests/:id/cancel - Cancel a request
router.put('/requests/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        msg: 'Request not found or cannot be cancelled'
      });
    }

    request.status = 'cancelled';
    await request.save();

    res.json({
      success: true,
      msg: 'Request cancelled successfully'
    });
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to cancel request'
    });
  }
});

// PUT /auth/requests/:id/finish - Mark a request as finished with optional feedback
router.put('/requests/:id/finish', authenticateToken, async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const request = await Request.findOne({
      _id: req.params.id,
      userId: req.user.id,
      status: 'attended'
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        msg: 'Request not found or cannot be marked as finished'
      });
    }

    // Update request status and feedback
    request.status = 'finished';
    if (rating) {
      request.volunteerRating = rating;
    }
    if (feedback) {
      request.volunteerFeedback = feedback;
    }
    
    await request.save();

    res.json({
      success: true,
      msg: 'Request marked as finished',
      request
    });
  } catch (error) {
    console.error('Error finishing request:', error);
    res.status(500).json({
      success: false,
      msg: 'Failed to mark request as finished'
    });
  }
});

module.exports = router; 