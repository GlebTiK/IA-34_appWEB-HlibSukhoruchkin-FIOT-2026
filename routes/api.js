'use strict';

const express = require('express');
const { body, query, validationResult } = require('express-validator');
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

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: Server is working
 */
router.get('/health', async (_req, res) => {
  res.json({ ok: true, service: 'Puppy Haven API' });
});

/**
 * @swagger
 * /api/puppies:
 *   get:
 *     summary: Get puppies list
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *     responses:
 *       200:
 *         description: Puppies list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Puppy'
 */
router.get('/puppies', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const page = Math.max(Number(req.query.page || 1), 1);
    const offset = (page - 1) * limit;
    const { rows, count } = await Puppy.findAndCountAll({ order: [['id', 'ASC']], limit, offset });
    res.json({ data: rows, page, limit, total: count });
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/puppies/{id}:
 *   get:
 *     summary: Get puppy by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Puppy object
 *       404:
 *         description: Puppy not found
 */
router.get('/puppies/:id', async (req, res, next) => {
  try {
    const puppy = await Puppy.findByPk(Number(req.params.id));
    if (!puppy) return res.status(404).json({ error: 'Puppy not found' });
    return res.json(puppy);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/visit_requests:
 *   get:
 *     summary: Get visit requests
 *     responses:
 *       200:
 *         description: Visit requests list
 */
router.get('/visit_requests', async (_req, res, next) => {
  try {
    const items = await VisitRequest.findAll({ order: [['id', 'DESC']], include: [{ model: Puppy, as: 'puppy' }] });
    res.json(items);
  } catch (e) {
    next(e);
  }
});

/**
 * @swagger
 * /api/visit_requests:
 *   post:
 *     summary: Create visit request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VisitRequestInput'
 *     responses:
 *       201:
 *         description: Visit request created
 *       400:
 *         description: Validation error
 */
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
