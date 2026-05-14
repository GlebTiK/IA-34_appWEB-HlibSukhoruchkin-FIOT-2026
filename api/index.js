'use strict';

const server = require('../server');
const app = server.app || server;
let initPromise = null;

module.exports = async function handler(req, res) {
  try {
    if (typeof server.initApp === 'function') {
      if (!initPromise) {
        initPromise = server.initApp();
      }
      await initPromise;
    }

    return app(req, res);
  } catch (error) {
    console.error('Vercel initialization failed:', error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      error: 'Server initialization failed',
      details: error && error.message ? error.message : String(error)
    }));
  }
};
