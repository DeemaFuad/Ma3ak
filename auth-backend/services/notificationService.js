const User = require('../models/User');
const Request = require('../models/Request');
const { sendMulticastNotification } = require('./fcmService');

const findNearbyVolunteers = async (latitude, longitude, maxDistance = 5000) => {
  try {
    const nearbyVolunteers = await User.find({
      role: 'volunteer',
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: maxDistance
        }
      }
    }).limit(20);

    return nearbyVolunteers;
  } catch (error) {
    console.error('Error finding nearby volunteers:', error);
    throw error;
  }
};

const notifyNearbyVolunteers = async (requestId) => {
  try {
    const request = await Request.findById(requestId).populate('userId', 'name');
    if (!request) {
      throw new Error('Request not found');
    }

    const nearbyVolunteers = await findNearbyVolunteers(
      request.location.latitude,
      request.location.longitude
    );

    // Update the request with notified volunteers
    request.notifiedVolunteers = nearbyVolunteers.map(volunteer => volunteer._id);
    await request.save();

    // Filter volunteers with valid device tokens
    const volunteersWithTokens = nearbyVolunteers.filter(v => v.deviceToken);
    const deviceTokens = volunteersWithTokens.map(v => v.deviceToken);

    if (deviceTokens.length > 0) {
      await sendMulticastNotification(deviceTokens, {
        title: 'New Assistance Request',
        body: `New ${request.assistanceType} request from ${request.userId.name}`,
        data: {
          requestId: request._id.toString(),
          type: 'NEW_REQUEST'
        }
      });
    }

    return nearbyVolunteers;
  } catch (error) {
    console.error('Error notifying nearby volunteers:', error);
    throw error;
  }
};

module.exports = {
  findNearbyVolunteers,
  notifyNearbyVolunteers
}; 