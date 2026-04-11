const admin = require('../config/firebase-admin');
const User = require('../models/User');

/**
 * Send push notification to specific FCM tokens.
 */
const sendToTokens = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  const validTokens = tokens.filter(Boolean);
  if (validTokens.length === 0) return;

  const message = {
    notification: { title, body },
    data: { title, body, ...data },
    tokens: validTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    // Clean up invalid tokens
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
        invalidTokens.push(validTokens[idx]);
      }
    });
    if (invalidTokens.length > 0) {
      await User.updateMany({}, { $pull: { fcmTokens: { $in: invalidTokens } } });
    }
    return response;
  } catch (error) {
    console.error('FCM sendToTokens error:', error.message);
    throw error;
  }
};

/**
 * Send push notification to a single user by their MongoDB _id.
 */
const sendToUser = async (userId, title, body, data = {}) => {
  const user = await User.findById(userId).select('fcmTokens');
  if (!user?.fcmTokens?.length) return;
  return sendToTokens(user.fcmTokens, title, body, data);
};

/**
 * Send push notification to all students in a school.
 */
const notifySchool = async (schoolId, title, body, data = {}) => {
  const users = await User.find({ schoolId, role: 'student', isActive: true }).select('fcmTokens');
  const allTokens = users.flatMap((u) => u.fcmTokens).filter(Boolean);
  if (allTokens.length === 0) return;
  return sendToTokens(allTokens, title, body, data);
};

/**
 * Send push notification via topic subscription.
 */
const sendToTopic = async (topic, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    data: { title, body, ...data },
    topic,
  };
  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('FCM sendToTopic error:', error.message);
    throw error;
  }
};

module.exports = { sendToTokens, sendToUser, notifySchool, sendToTopic };
