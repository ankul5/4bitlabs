/**
 * Leaderboard Socket Handler
 * Emits real-time leaderboard updates to all clients in a course room.
 * Called from quizController.js after quiz submission.
 *
 * Usage in controller:
 *   req.io.to(`leaderboard_${courseId}`).emit('leaderboard:update', payload);
 */

const emitLeaderboardUpdate = (io, courseId, payload) => {
  io.to(`leaderboard_${courseId}`).emit('leaderboard:update', payload);
};

module.exports = { emitLeaderboardUpdate };
