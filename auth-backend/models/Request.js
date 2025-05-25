const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  assistanceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: {
      type: String,
      required: false
    }
  },  
  status: {
    type: String,
    enum: ['pending', 'attended', 'finished', 'cancelled'],
    default: 'pending',
  },
  notifiedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignedVolunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  volunteerRating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },
  volunteerFeedback: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Add index for geospatial queries
RequestSchema.index({ 'location': '2dsphere' });

// Update the updatedAt timestamp before saving
RequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Request', RequestSchema, 'requests'); 