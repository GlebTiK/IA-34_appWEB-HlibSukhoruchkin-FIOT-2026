'use strict';

const path = require('path');
const express = require('express');
require('dotenv').config();

const { sequelize, Puppy, VisitRequest } = require('./models');

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
    res.status(500).json({ ok: false, db: 'disconnected', error: String(e?.message || e) });
  }
});

app.get('/api/puppies', async (_req, res) => {
  try {
    const items = await Puppy.findAll({ order: [['id', 'ASC']] });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load puppies', details: String(e?.message || e) });
  }
});

app.get('/api/visit_requests', async (_req, res) => {
  try {
    const items = await VisitRequest.findAll({ order: [['id', 'DESC']], include: [{ model: Puppy, as: 'puppy' }] });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load visit requests', details: String(e?.message || e) });
  }
});

app.post('/api/visit_requests', async (req, res) => {
  try {
    const { puppy_id, visitor_name, phone, visit_datetime, note } = req.body || {};
    const pid = Number(puppy_id);
    if (!Number.isFinite(pid) || pid <= 0) return res.status(400).json({ error: 'puppy_id is required and must be a positive number' });
    if (!visitor_name || String(visitor_name).trim().length < 2) return res.status(400).json({ error: 'visitor_name is required' });
    if (!phone || String(phone).trim().length < 5) return res.status(400).json({ error: 'phone is required' });
    if (!visit_datetime || String(visit_datetime).trim().length < 10) return res.status(400).json({ error: 'visit_datetime is required' });

    const puppy = await Puppy.findByPk(pid);
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });

    const created = await VisitRequest.create({
      puppy_id: pid,
      visitor_name: String(visitor_name).trim(),
      phone: String(phone).trim(),
      visit_datetime: new Date(visit_datetime),
      note: note ? String(note) : null
    });

    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Failed to create visit request', details: String(e?.message || e) });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

(async () => {
  try {
    await sequelize.authenticate();
    if (SHOULD_SYNC) await sequelize.sync();
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
