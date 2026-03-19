'use strict';

const path = require('path');
const express = require('express');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.send('Hello from Node.js server');
});

app.use('/app', express.static(path.join(__dirname, 'public')));

let students = [
  { id: 1, name: 'Hlib Sukhoruchkin', group: 'IA-34' },
  { id: 2, name: 'Andrey Angel', group: 'IA-34' }
];

app.get('/students', (_req, res) => {
  res.json(students);
});

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

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
