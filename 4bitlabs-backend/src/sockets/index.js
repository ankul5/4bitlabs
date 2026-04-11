const leaderboardSocket = require('./leaderboardSocket');
const chatSocket = require('./chatSocket');

/**
 * Register all Socket.IO event handlers.
 * Called once from server.js with the io instance.
 */
const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ─── Leaderboard room ───────────────────────────────────────────────────
    socket.on('join:leaderboard', (courseId) => {
      socket.join(`leaderboard_${courseId}`);
      console.log(`📊 ${socket.id} joined leaderboard room: ${courseId}`);
    });

    socket.on('leave:leaderboard', (courseId) => {
      socket.leave(`leaderboard_${courseId}`);
    });

    // ─── Chat room ───────────────────────────────────────────────────────────
    socket.on('join:chat', (courseId) => {
      socket.join(`chat_${courseId}`);
      console.log(`💬 ${socket.id} joined chat room: ${courseId}`);
    });

    socket.on('leave:chat', (courseId) => {
      socket.leave(`chat_${courseId}`);
    });

    // ─── Send chat message via Socket.IO (mirrors Firestore fallback) ────────
    socket.on('message:send', (data) => {
      const { courseId, message } = data;
      // Broadcast to everyone in the room except the sender
      socket.to(`chat_${courseId}`).emit('message:receive', message);
    });

    // ─── Disconnect ──────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      console.log(`⚡ Socket disconnected: ${socket.id} — ${reason}`);
    });
  });
};

module.exports = { registerSocketHandlers };
