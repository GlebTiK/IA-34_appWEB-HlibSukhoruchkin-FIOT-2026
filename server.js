'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const logger = require('./utils/logger');
const { sequelize, User } = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SHOULD_SYNC = String(process.env.SEQUELIZE_SYNC || 'false').toLowerCase() === 'true';

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX || 120),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' }
}));

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.get('/api/status', (_req, res) => {
  res.json({ uptime: process.uptime(), memoryUsage: process.memoryUsage(), cpuUsage: process.cpuUsage(), nodeVersion: process.version });
});
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;
  const email = String(adminEmail).trim().toLowerCase();
  const existing = await User.findOne({ where: { email } });
  if (existing) return;
  await User.create({
    full_name: process.env.ADMIN_FULL_NAME || 'Administrator',
    email,
    password_hash: await bcrypt.hash(String(adminPassword), 10),
    role: 'admin',
    is_active: true
  });
}

async function start() {
  await sequelize.authenticate();
  if (SHOULD_SYNC) await sequelize.sync();
  await ensureAdmin();
  return app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
}

if (require.main === module) {
  start().catch((e) => {
    logger.error('Failed to start server', { stack: e.stack });
    process.exit(1);
  });
}

module.exports = { app, start };
