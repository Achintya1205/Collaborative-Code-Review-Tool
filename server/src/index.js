const http = require('http');
const app = require('./app');
const config = require('./config/env');
const connectDB = require('./config/db');
require('./config/redis'); 
const initSocket = require('./sockets/socketManager');

async function start() {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(config.port, () => {
    console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`);
  });
}

start();