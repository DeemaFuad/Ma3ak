const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const jwt = require('jsonwebtoken');

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, msg: 'No token provided' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ success: false, msg: 'Invalid token' });
      req.user = user;
      next();
    });
}

// Get all tasks for a volunteer (accepted, ongoing, and completed)
router.get('/my-tasks', authenticateToken, async (req, res) => {
  try {
    const volunteerId = req.user.id;

    // Get all tasks where the volunteer is assigned
    const tasks = await Request.find({
      assignedVolunteer: volunteerId
    })
    .populate('userId', 'name email')
    .sort({ updatedAt: -1 });

    // Separate tasks into different categories
    const ongoingTasks = tasks.filter(task => task.status === 'attended');
    const completedTasks = tasks.filter(task => task.status === 'finished');

    res.json({
      ongoingTasks,
      completedTasks
    });
  } catch (error) {
    console.error('Error fetching volunteer tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a task as finished
router.put('/finish-task/:requestId', authenticateToken, async (req, res) => {
  try {
    const { requestId } = req.params;
    const volunteerId = req.user.id;

    const task = await Request.findOne({
      _id: requestId,
      assignedVolunteer: volunteerId
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'attended') {
      return res.status(400).json({ message: 'Task is not in progress' });
    }

    task.status = 'finished';
    await task.save();

    res.json({ message: 'Task marked as finished successfully', task });
  } catch (error) {
    console.error('Error finishing task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 