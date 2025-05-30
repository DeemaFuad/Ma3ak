const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Request = require('../models/Request');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all requests (current and past)
router.get('/requests', async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const requests = await Request.find(query)
      .populate('userId', 'name email userType')
      .populate('assignedVolunteer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      requests,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// Get users by role with search
router.get('/users', async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.userType = role;
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

// Update request status
router.patch('/requests/:requestId/status', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    if (!['pending', 'attended', 'finished', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        msg: 'Invalid status' 
      });
    }

    const request = await Request.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    ).populate('userId', 'name email userType')
     .populate('assignedVolunteer', 'name email');

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        msg: 'Request not found' 
      });
    }

    res.json({ success: true, request });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
});

module.exports = router; 