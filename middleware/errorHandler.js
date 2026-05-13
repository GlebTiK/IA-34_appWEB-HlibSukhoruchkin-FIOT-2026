'use strict';

let logger;
try {
  logger = require('../utils/logger');
} catch (_e) {
  logger = console;
}

module.exports = function errorHandler(err, req, res, _next) {
  const status = err && err.status ? err.status : 500;
  const message = err && err.publicMessage ? err.publicMessage : 'Internal server error';

  if (logger && typeof logger.error === 'function') {
    logger.error('Unhandled error', {
      method: req.method,
      url: req.originalUrl,
      status,
      stack: err && err.stack ? err.stack : String(err)
    });
  }

  return res.status(status).json({ error: message });
};
