'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function errorHandler(err, req, res, _next) {
  try {
    const dir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const file = path.join(dir, 'errors.log');
    const text = [
      '[' + new Date().toISOString() + ']',
      req.method + ' ' + req.originalUrl,
      err && err.stack ? err.stack : String(err),
      '----------------------------------------'
    ].join('\n') + '\n';

    fs.appendFileSync(file, text, 'utf8');
  } catch (_logError) {
  }

  return res.status(err && err.status ? err.status : 500).json({
    error: err && err.publicMessage ? err.publicMessage : 'Internal server error'
  });
};
