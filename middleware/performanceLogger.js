'use strict';

const logger = require('../utils/logger');

module.exports = function performanceLogger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    logger.info('request_completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: Number(durationMs.toFixed(2))
    });
  });
  next();
};
