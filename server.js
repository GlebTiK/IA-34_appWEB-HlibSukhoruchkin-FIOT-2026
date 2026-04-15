'use strict';

const path = require('path');
const express = require('express');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const { sequelize, Puppy, VisitRequest, User } = require('./models');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SHOULD_SYNC = String(process.env.SEQUELIZE_SYNC || 'false').toLowerCase() === 'true';

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/api/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true, db: 'connected' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'disconnected', error: String(e && e.message ? e.message : e) });
  }
});

app.get('/api/puppies', async (_req, res) => {
  try {
    const items = await Puppy.findAll({ order: [['id', 'ASC']] });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load puppies', details: String(e && e.message ? e.message : e) });
  }
});

app.get('/api/visit_requests', async (_req, res) => {
  try {
    const items = await VisitRequest.findAll({
      order: [['id', 'DESC']],
      include: [{ model: Puppy, as: 'puppy' }]
    });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load visit requests', details: String(e && e.message ? e.message : e) });
  }
});

app.post('/api/visit_requests', async (req, res) => {
  try {
    const body = req.body || {};
    const pid = Number(body.puppy_id);

    if (!Number.isFinite(pid) || pid <= 0) {
      return res.status(400).json({ error: 'puppy_id is required and must be a positive number' });
    }

    if (!body.visitor_name || String(body.visitor_name).trim().length < 2) {
      return res.status(400).json({ error: 'visitor_name is required' });
    }

    if (!body.phone || String(body.phone).trim().length < 5) {
      return res.status(400).json({ error: 'phone is required' });
    }

    if (!body.visit_datetime || String(body.visit_datetime).trim().length < 10) {
      return res.status(400).json({ error: 'visit_datetime is required' });
    }

    const puppy = await Puppy.findByPk(pid);
    if (!puppy) {
      return res.status(404).json({ error: 'Puppy not found' });
    }

    const created = await VisitRequest.create({
      puppy_id: pid,
      visitor_name: String(body.visitor_name).trim(),
      phone: String(body.phone).trim(),
      visit_datetime: new Date(body.visit_datetime),
      note: body.note ? String(body.note) : null
    });

    return res.status(201).json(created);
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create visit request', details: String(e && e.message ? e.message : e) });
  }
});

app.use('/api/auth', authRoutes);

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

async function ensureAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminFullName = process.env.ADMIN_FULL_NAME || 'Administrator';

  if (!adminEmail || !adminPassword) {
    return;
  }

  const existing = await User.findOne({ where: { email: String(adminEmail).trim().toLowerCase() } });
  if (existing) {
    return;
  }

  const passwordHash = await bcrypt.hash(String(adminPassword), 10);

  await User.create({
    full_name: adminFullName,
    email: String(adminEmail).trim().toLowerCase(),
    password_hash: passwordHash,
    role: 'admin',
    is_active: true
  });
}

(async () => {
  try {
    await sequelize.authenticate();
    if (SHOULD_SYNC) {
      await sequelize.sync();
    }
    await ensureAdmin();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
