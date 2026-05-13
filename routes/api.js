'use strict';

const express = require('express');
const { body, validationResult } = require('express-validator');
const { Puppy, VisitRequest } = require('../models');

const router = express.Router();

function validationFailed(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: 'Validation failed', details: errors.array() });
    return true;
  }
  return false;
}

router.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'Puppy Haven API' });
});

router.get('/puppies', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const offset = (page - 1) * limit;
    const { rows, count } = await Puppy.findAndCountAll({ order: [['id', 'ASC']], limit, offset });
    res.json({ data: rows, page, limit, total: count });
  } catch (e) {
    next(e);
  }
});

router.get('/visit_requests', async (_req, res, next) => {
  try {
    const items = await VisitRequest.findAll({ order: [['id', 'DESC']], include: [{ model: Puppy, as: 'puppy' }] });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

router.post('/visit_requests', [
  body('puppy_id').isInt({ min: 1 }),
  body('visitor_name').trim().isLength({ min: 2 }),
  body('phone').trim().isLength({ min: 5 }),
  body('visit_datetime').isISO8601().toDate(),
  body('note').optional({ nullable: true }).trim().isLength({ max: 1000 })
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const puppy = await Puppy.findByPk(Number(req.body.puppy_id));
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });

    const created = await VisitRequest.create({
      puppy_id: Number(req.body.puppy_id),
      visitor_name: String(req.body.visitor_name).trim(),
      phone: String(req.body.phone).trim(),
      visit_datetime: req.body.visit_datetime,
      note: req.body.note ? String(req.body.note).trim() : null
    });

    return res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

module.exports = router;
