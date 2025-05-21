const admin = require('firebase-admin');
const serviceAccount = require('../config/firebase-service-account.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const sendPushNotification = async (deviceToken, notification) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      token: deviceToken
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

const sendMulticastNotification = async (deviceTokens, notification) => {
  try {
    const message = {
      notification: {
        title: notification.title,
        body: notification.body
      },
      data: notification.data || {},
      tokens: deviceTokens
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log('Successfully sent multicast notification:', response);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
};

module.exports = {
  sendPushNotification,
  sendMulticastNotification
}; 