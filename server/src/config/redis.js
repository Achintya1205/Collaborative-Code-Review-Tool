const Redis = require('ioredis');
const config = require('./env');

console.log('Redis URL host being used:', new URL(config.redisUrl).host);

const redisClient = new Redis(config.redisUrl);

redisClient.on('connect', () => {
  console.log('Redis connected');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

module.exports = redisClient;