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

app.get('/', (_req, res) => {
  res.send('Hello from Node.js server');
});

app.use('/app', express.static(path.join(__dirname, 'public')));

let students = [
  { id: 1, name: 'Hlib Sukhoruchkin', group: 'IA-34' },
  { id: 2, name: 'Andrey Angel', group: 'IA-34' }
];

app.get('/students', (_req, res) => res.json(students));

app.post('/students', (req, res) => {
  const { id, name, group } = req.body || {};
  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) return res.status(400).json({ error: 'Field "id" must be a positive integer' });
  if (!name || String(name).trim().length < 2) return res.status(400).json({ error: 'Field "name" is required' });
  if (!group || String(group).trim().length < 2) return res.status(400).json({ error: 'Field "group" is required' });
  if (students.some(s => s.id === parsedId)) return res.status(409).json({ error: 'Student with this id already exists' });
  const student = { id: parsedId, name: String(name).trim(), group: String(group).trim() };
  students.push(student);
  res.status(201).json(student);
});

app.put('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id in URL' });
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  const { name, group } = req.body || {};
  if (name !== undefined) {
    if (!String(name).trim()) return res.status(400).json({ error: 'Invalid "name"' });
    students[idx].name = String(name).trim();
  }
  if (group !== undefined) {
    if (!String(group).trim()) return res.status(400).json({ error: 'Invalid "group"' });
    students[idx].group = String(group).trim();
  }
  res.json(students[idx]);
});

app.delete('/students/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'Invalid id in URL' });
  const idx = students.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Student not found' });
  const removed = students.splice(idx, 1)[0];
  res.json({ deleted: true, student: removed });
});

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
