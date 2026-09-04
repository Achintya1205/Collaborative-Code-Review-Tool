const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { setIO } = require('./io');
const redisClient = require('../config/redis');
const { addViewer, removeViewer, getViewers } = require('../services/presence.service');

function generateGuestName() {
  return `Guest-${Math.floor(1000 + Math.random() * 9000)}`;
}

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:4200',
    },
  });

  // Redis adapter: makes io.to(room).emit() work correctly even if this app
  // is ever scaled to multiple server instances, since each instance's
  // in-memory Socket.IO wouldn't otherwise know about sockets connected to
  // other instances. Pub/sub is handled internally by the adapter.
  const pubClient = redisClient.duplicate();
  const subClient = redisClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  setIO(io);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-session', async (sessionId) => {
      socket.join(sessionId);
      socket.data.sessionId = sessionId;
      socket.data.guestName = generateGuestName();

      await addViewer(sessionId, socket.id, socket.data.guestName);
      const viewers = await getViewers(sessionId);

      io.to(sessionId).emit('presence-update', viewers);
      console.log(`Socket ${socket.id} joined session ${sessionId} as ${socket.data.guestName}`);
    });

    socket.on('leave-session', async (sessionId) => {
      socket.leave(sessionId);
      await removeViewer(sessionId, socket.id);
      const viewers = await getViewers(sessionId);

      io.to(sessionId).emit('presence-update', viewers);
      socket.to(sessionId).emit('cursor-left', socket.id);
      console.log(`Socket ${socket.id} left session ${sessionId}`);
    });

    // Live cursor: purely ephemeral pass-through broadcast, no storage.
    // Line-granularity, not per-character — fits a diff viewer better than
    // pixel-level cursor tracking would.
    socket.on('cursor-move', ({ filePath, lineNumber }) => {
      const { sessionId, guestName } = socket.data;
      if (!sessionId) return;

      socket.to(sessionId).emit('cursor-update', {
        socketId: socket.id,
        guestName,
        filePath,
        lineNumber,
      });
    });

    socket.on('disconnect', async () => {
      const { sessionId } = socket.data;

      if (sessionId) {
        await removeViewer(sessionId, socket.id);
        const viewers = await getViewers(sessionId);
        io.to(sessionId).emit('presence-update', viewers);
        socket.to(sessionId).emit('cursor-left', socket.id);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;