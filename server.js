'use strict';

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const logger = require('./utils/logger');
const swaggerSpec = require('./swagger');
const { sequelize, User } = require('./models');
const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SHOULD_SYNC = String(process.env.SEQUELIZE_SYNC || 'false').toLowerCase() === 'true';
let initPromise = null;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

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

async function initApp() {
  if (!initPromise) {
    initPromise = (async () => {
      await sequelize.authenticate();
      if (SHOULD_SYNC) await sequelize.sync();
      await ensureAdmin();
      logger.info('Application initialized');
    })();
  }
  return initPromise;
}

async function start() {
  await initApp();
  return app.listen(PORT, () => logger.info(`Server running on ${PORT}`));
}

if (require.main === module) {
  start().catch((e) => {
    logger.error('Failed to start server', { stack: e.stack });
    process.exit(1);
  });
}

module.exports = app;
module.exports.app = app;
module.exports.start = start;
module.exports.initApp = initApp;
