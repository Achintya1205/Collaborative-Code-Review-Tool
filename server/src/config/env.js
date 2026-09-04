require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/code-review-tool',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
};

module.exports = config;