const { Redis } = require('ioredis');
const ENV = require('./env');

const redis = new Redis({
  host: ENV.REDIS_HOST,
  port: ENV.REDIS_PORT,
  maxRetriesPerRequest: null,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

module.exports = redis;
