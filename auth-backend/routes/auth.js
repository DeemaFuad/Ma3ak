const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Sign up
router.post('/signup', async (req, res) => {
  const { name, email, password, userType, phoneNumber, major, year, bio } = req.body;

  if (!name || !email || !password || !userType || !phoneNumber) {
    return res.status(400).json({ msg: 'Please fill all required fields' });
  }

  if (!['blind', 'volunteer'].includes(userType)) {
    return res.status(400).json({ msg: 'Invalid user type' });
  }

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: 'User already exists' });

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
    res.status(500).json({ msg: 'Server error', error: err.message });
    console.log(err);
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid email or password' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

module.exports = router;
