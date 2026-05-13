'use strict';

const NodeCache = require('node-cache');
const logger = require('./logger');

const memoryCache = new NodeCache({ stdTTL: Number(process.env.CACHE_TTL_SECONDS || 60) });
let redisClient = null;

async function connectRedis() {
  if (!process.env.REDIS_URL) return null;
  if (redisClient) return redisClient;

  const { createClient } = require('redis');
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => logger.error('redis_error', { message: err.message }));
  await redisClient.connect();
  logger.info('Redis cache connected');
  return redisClient;
}

async function getCache(key) {
  const redis = await connectRedis();
  if (redis) {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : undefined;
  }
  return memoryCache.get(key);
}

async function setCache(key, value, ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 60)) {
  const redis = await connectRedis();
  if (redis) {
    await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
    return;
  }
  memoryCache.set(key, value, ttlSeconds);
}

async function delCache(key) {
  const redis = await connectRedis();
  if (redis) await redis.del(key);
  memoryCache.del(key);
}

module.exports = { getCache, setCache, delCache };
