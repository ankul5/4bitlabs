const { pool } = require('../config/database');

const registerSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ─── Leaderboard rooms ────────────────────────────────────────────────────
    socket.on('join:leaderboard', (courseId) => {
      socket.join(`leaderboard_${courseId}`);
    });
    socket.on('leave:leaderboard', (courseId) => {
      socket.leave(`leaderboard_${courseId}`);
    });

    // ─── Chat rooms ────────────────────────────────────────────────────────────
    socket.on('join:chat', (roomId) => {
      socket.join(`chat_${roomId}`);
      console.log(`Socket ${socket.id} joined chat room: ${roomId}`);
    });

    socket.on('leave:chat', (roomId) => {
      socket.leave(`chat_${roomId}`);
    });

    // ─── Real-time chat message ────────────────────────────────────────────────
    socket.on('chat:message', async (data) => {
      const { roomId, message, senderId, senderName, senderAvatar, senderRole } = data;
      try {
        const { rows } = await pool.query(
          `INSERT INTO chat_messages (room_id, sender_id, sender_name, sender_avatar, sender_role, message)
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
          [roomId, senderId, senderName, senderAvatar || '', senderRole || 'student', message]
        );
        const msg = {
          id: rows[0].id, roomId: rows[0].room_id, senderId: rows[0].sender_id,
          senderName: rows[0].sender_name, senderAvatar: rows[0].sender_avatar,
          senderRole: rows[0].sender_role, message: rows[0].message, createdAt: rows[0].created_at,
        };
        // Send to everyone in room (including sender so all get the DB-persisted version)
        io.to(`chat_${roomId}`).emit('chat:message', msg);
      } catch (err) {
        console.error('Chat message error:', err.message);
        socket.emit('chat:error', { message: 'Failed to send message.' });
      }
    });

    // ─── Typing indicator ──────────────────────────────────────────────────────
    socket.on('chat:typing', (data) => {
      socket.to(`chat_${data.roomId}`).emit('chat:typing', { name: data.name, isTyping: data.isTyping });
    });

    // ─── Legacy course chat (keep backward compat) ────────────────────────────
    socket.on('message:send', (data) => {
      const { courseId, message } = data;
      socket.to(`chat_${courseId}`).emit('message:receive', message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} — ${reason}`);
    });
  });
};

module.exports = { registerSocketHandlers };
