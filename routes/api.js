'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Puppy, VisitRequest } = require('../models');
const { getCache, setCache, delCache } = require('../utils/cache');

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

router.get('/puppies', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const cacheKey = `puppies:v1:page:${page}:limit:${limit}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json({ source: 'cache', ...cached });

    const offset = (page - 1) * limit;
    const result = await Puppy.findAndCountAll({
      attributes: ['id', 'name', 'description', 'age_months', 'price_uah', 'photo_url', 'created_at'],
      order: [['id', 'ASC']],
      limit,
      offset
    });

    const payload = { data: result.rows, page, limit, total: result.count };
    await setCache(cacheKey, payload, 60);
    return res.json({ source: 'database', ...payload });
  } catch (e) {
    next(e);
  }
});

router.post('/puppies', [
  body('name').trim().isLength({ min: 2, max: 255 }),
  body('description').optional({ nullable: true }).trim().isLength({ max: 5000 }),
  body('age_months').isInt({ min: 1, max: 120 }),
  body('price_uah').isFloat({ min: 1 }),
  body('photo_url').optional({ nullable: true }).isLength({ max: 1024 })
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const puppy = await Puppy.create({
      name: String(req.body.name).trim(),
      description: req.body.description ? String(req.body.description).trim() : null,
      age_months: Number(req.body.age_months),
      price_uah: Number(req.body.price_uah),
      photo_url: req.body.photo_url || null
    });
    await delCache('puppies:v1:page:1:limit:20');
    return res.status(201).json(puppy);
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
  body('phone').trim().isLength({ min: 5, max: 64 }),
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
