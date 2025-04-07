const mongoose = require('mongoose');

const emailValidator = (email) => {
  return email.endsWith('@university.edu'); // the user should use their university email address
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      unique: true, 
      required: true, 
      validate: [emailValidator, 'Please use your university email address']
    },
    password: { type: String, required: true },
    userType: {
      type: String,
      enum: ['blind', 'volunteer'],
      required: true,
    },
    major: { type: String, required: false }, 
    year: { 
      type: String, 
      enum: ['First', 'Second', 'Third', 'Fourth'], 
      required: false 
    }, 
    phoneNumber: { type: String, required: true }, 
    bio: { type: String, required: false }, // Optional: A brief bio or description
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema, 'userss'); 