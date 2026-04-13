const { pool } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// ─── GET /api/v1/chat/:roomId — Get chat history ─────────────────────────────
const getChatHistory = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const { rows } = await pool.query(
      `SELECT * FROM chat_messages WHERE room_id = $1 ORDER BY created_at ASC LIMIT $2`,
      [roomId, limit]
    );

    const messages = rows.map(row => ({
      id: row.id,
      roomId: row.room_id,
      senderId: row.sender_id,
      senderName: row.sender_name,
      senderAvatar: row.sender_avatar,
      senderRole: row.sender_role,
      message: row.message,
      messageType: row.message_type,
      createdAt: row.created_at,
    }));

    res.json(successResponse('Chat history fetched.', { messages, count: messages.length }));
  } catch (error) {
    next(error);
  }
};

// ─── POST /api/v1/chat/:roomId — Send a message (REST fallback) ──────────────
const sendMessage = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { message, messageType = 'text' } = req.body;
    const userId = req.user._id || req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json(errorResponse('Message is required.'));
    }

    const { rows } = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, sender_name, sender_avatar, sender_role, message, message_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [roomId, userId, req.user.name, req.user.avatar || '', req.user.role, message.trim(), messageType]
    );

    const msg = {
      id: rows[0].id,
      roomId: rows[0].room_id,
      senderId: rows[0].sender_id,
      senderName: rows[0].sender_name,
      senderAvatar: rows[0].sender_avatar,
      senderRole: rows[0].sender_role,
      message: rows[0].message,
      messageType: rows[0].message_type,
      createdAt: rows[0].created_at,
    };

    // Emit via Socket.IO
    if (req.io) {
      req.io.to(`chat_${roomId}`).emit('message:receive', msg);
    }

    res.status(201).json(successResponse('Message sent.', { message: msg }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getChatHistory, sendMessage };
