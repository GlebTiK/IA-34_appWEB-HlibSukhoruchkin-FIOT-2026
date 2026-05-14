'use strict';

const fs = require('fs');
const path = require('path');
const winston = require('winston');

const isVercel = process.env.VERCEL === '1' || Boolean(process.env.VERCEL_URL);
const transports = [];

if (!isVercel) {
  const logDir = process.env.LOG_DIR || path.join(__dirname, '..', 'logs');

  try {
    fs.mkdirSync(logDir, { recursive: true });
    transports.push(new winston.transports.File({ filename: path.join(logDir, 'app.log') }));
    transports.push(new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }));
  } catch (error) {
    // On serverless/read-only file systems, file logging can fail.
    // Falling back to console keeps the API alive.
    console.warn('File logging disabled:', error.message);
  }
}

if (isVercel || process.env.NODE_ENV !== 'test' || transports.length === 0) {
  transports.push(new winston.transports.Console({ format: winston.format.simple() }));
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});

module.exports = logger;
