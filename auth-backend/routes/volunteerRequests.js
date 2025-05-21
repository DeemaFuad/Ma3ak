const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, msg: 'No token provided' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, msg: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Get all requests sorted by distance from volunteer's location
router.get('/requests', auth, async (req, res) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query; // maxDistance in meters
    console.log('Received request with params:', { latitude, longitude, maxDistance });

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }

    // Validate coordinate ranges
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    console.log('Parsed coordinates:', { lat, lng });

    if (
      isNaN(lat) || 
      lat < -90 || 
      lat > 90 ||
      isNaN(lng) ||
      lng < -180 || 
      lng > 180
    ) {
      return res.status(400).json({ message: 'Invalid coordinate values' });
    }

    // Validate maxDistance
    const distance = parseInt(maxDistance);
    if (isNaN(distance) || distance <= 0 || distance > 50000) {
      return res.status(400).json({ message: 'Invalid maxDistance value' });
    }

    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Finding requests near coordinates:', [lng, lat], 'with maxDistance:', distance);
    const requests = await Request.find({
      status: 'pending',
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat]
          },
          $maxDistance: distance
        }
      }
    })
    .populate('userId', 'name phone')
    .sort({ createdAt: -1 });

    console.log('Found', requests.length, 'requests');
    res.json(requests);
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ 
      message: 'Failed to fetch requests',
      error: error.message 
    });
  }
});

// Get requests that the volunteer has been notified about
router.get('/notified-requests', auth, async (req, res) => {
  try {
    const requests = await Request.find({
      notifiedVolunteers: req.user.id,
      status: 'pending'
    })
    .populate('userId', 'name phone')
    .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error fetching notified requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Attend a request
router.post('/attend/:requestId', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.requestId);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer available' });
    }

    request.status = 'attended';
    request.assignedVolunteer = req.user.id;
    await request.save();

    res.json({ message: 'Successfully attended request', request });
  } catch (error) {
    console.error('Error attending request:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update volunteer's location
router.post('/update-location', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'Location coordinates are required' });
    }

    // Validate coordinate ranges
    if (
      typeof latitude !== 'number' || 
      latitude < -90 || 
      latitude > 90 ||
      typeof longitude !== 'number' ||
      longitude < -180 || 
      longitude > 180
    ) {
      return res.status(400).json({ message: 'Invalid coordinate values' });
    }

    // Check if user exists
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update location
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          type: 'Point',
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        },
        lastLocationUpdate: new Date()
      },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('Failed to update user location');
    }

    res.json({ message: 'Location updated successfully' });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({ 
      message: 'Failed to update location',
      error: error.message 
    });
  }
});

module.exports = router; 