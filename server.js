'use strict';

const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const logger = require('./utils/logger');
const performanceLogger = require('./middleware/performanceLogger');
const { sequelize, User } = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SHOULD_SYNC = String(process.env.SEQUELIZE_SYNC || 'false').toLowerCase() === 'true';

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined'));
app.use(performanceLogger);

app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/files', uploadRoutes);

app.get('/api/status', (_req, res) => {
  res.json({
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    nodeVersion: process.version
  });
});

app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME || 'Administrator';
  if (!adminEmail || !adminPassword) return;

  const email = String(adminEmail).trim().toLowerCase();
  const existing = await User.findOne({ where: { email } });
  if (existing) return;

  await User.create({
    full_name: adminFullName,
    email,
    password_hash: await bcrypt.hash(String(adminPassword), 10),
    role: 'admin',
    is_active: true
  });
}

if (require.main === module) {
  (async () => {
    try {
      await sequelize.authenticate();
      if (SHOULD_SYNC) await sequelize.sync();
      await ensureAdmin();
      app.listen(PORT, () => logger.info(`Server started on port ${PORT}`));
    } catch (e) {
      logger.error('Failed to start server', { stack: e.stack });
      process.exit(1);
    }
  })();
}

module.exports = app;
