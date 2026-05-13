'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');

module.exports = async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !String(header).startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token is required' });
    }

    const token = String(header).slice(7).trim();
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    const user = await User.findByPk(payload.user_id);

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User is not available' });
    }

    req.user = user;
    return next();
  } catch (_e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
