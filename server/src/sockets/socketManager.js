const { Server } = require('socket.io');
const { setIO } = require('./io');
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
      console.log(`Socket ${socket.id} left session ${sessionId}`);
    });

    socket.on('disconnect', async () => {
      const { sessionId } = socket.data;

      if (sessionId) {
        await removeViewer(sessionId, socket.id);
        const viewers = await getViewers(sessionId);
        io.to(sessionId).emit('presence-update', viewers);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;