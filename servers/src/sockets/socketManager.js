const { Server } = require('socket.io');

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:4200',
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
      console.log(`Socket ${socket.id} joined session ${sessionId}`);
    });

    socket.on('leave-session', (sessionId) => {
      socket.leave(sessionId);
      console.log(`Socket ${socket.id} left session ${sessionId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;