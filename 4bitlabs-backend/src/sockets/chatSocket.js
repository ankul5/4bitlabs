/**
 * Chat Socket Handler
 * Real-time chat is primarily handled via Firebase Firestore on the client.
 * This Socket.IO handler provides a fallback/supplement for instant delivery
 * when Firestore latency is a concern.
 *
 * Client events:
 *   - join:chat(courseId)         — join a course chat room
 *   - leave:chat(courseId)        — leave a course chat room
 *   - message:send({ courseId, message })  — broadcast a message
 *
 * Server events emitted:
 *   - message:receive(message)    — received by all in the room
 */

const emitChatMessage = (io, courseId, message) => {
  io.to(`chat_${courseId}`).emit('message:receive', message);
};

module.exports = { emitChatMessage };
