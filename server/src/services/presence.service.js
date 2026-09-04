const redisClient = require('../config/redis');

function presenceKey(sessionId) {
  return `presence:${sessionId}`;
}

async function addViewer(sessionId, socketId, guestName) {
  await redisClient.hset(presenceKey(sessionId), socketId, guestName);
}

async function removeViewer(sessionId, socketId) {
  await redisClient.hdel(presenceKey(sessionId), socketId);
}

async function getViewers(sessionId) {
  const viewers = await redisClient.hvals(presenceKey(sessionId));
  return viewers;
}

module.exports = { addViewer, removeViewer, getViewers };