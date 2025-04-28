const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  userType: {
    type: String,
    required: [true, 'User type is required'],
    enum: ['blind', 'volunteer'],
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  major: {
    type: String,
    trim: true
  },
  year: {
    type: String,
    enum: ['First', 'Second', 'Third', 'Fourth'],
    trim: true
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Create index for email

module.exports = mongoose.model('User', userSchema); 