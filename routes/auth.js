'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const { User, RefreshToken } = require('../models');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const loginLimiter = require('../middleware/loginLimiter');

const router = express.Router();

function makeAccessToken(user) {
  return jwt.sign({ user_id: user.id, email: user.email, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

function makeRefreshToken(user) {
  return jwt.sign({ user_id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

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
 * /api/auth/register:
 *   post:
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserRegisterInput'
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/register', [
  body('full_name').trim().isLength({ min: 2 }).withMessage('full_name must contain at least 2 characters'),
  body('email').trim().isEmail().withMessage('email must be valid'),
  body('password').isLength({ min: 6 }).withMessage('password must contain at least 6 characters'),
  body('password_confirm').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('password_confirm does not match password');
    return true;
  })
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const email = String(req.body.email).trim().toLowerCase();
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'User with this email already exists' });

    const user = await User.create({
      full_name: String(req.body.full_name).trim(),
      email,
      password_hash: await bcrypt.hash(String(req.body.password), 10),
      role: 'user',
      is_active: true
    });

    return res.status(201).json({ message: 'User created', user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role } });
  } catch (e) {
    return next(e);
  }
});

router.post('/login', loginLimiter, [
  body('email').trim().isEmail().withMessage('email must be valid'),
  body('password').notEmpty().withMessage('password is required')
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const email = String(req.body.email).trim().toLowerCase();
    const user = await User.findOne({ where: { email } });
    if (!user || !user.is_active) return res.status(401).json({ error: 'Invalid email or password' });

    const ok = await bcrypt.compare(String(req.body.password), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const accessToken = makeAccessToken(user);
    const refreshToken = makeRefreshToken(user);

    await RefreshToken.create({ user_id: user.id, token: refreshToken, expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    return res.json({
      message: 'Login successful',
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role }
    });
  } catch (e) {
    return next(e);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const token = req.body && req.body.refresh_token ? String(req.body.refresh_token) : '';
    if (!token) return res.status(400).json({ error: 'refresh_token is required' });
    const saved = await RefreshToken.findOne({ where: { token } });
    if (!saved) return res.status(401).json({ error: 'Refresh token not found' });

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(payload.user_id);
    if (!user || !user.is_active) return res.status(401).json({ error: 'User is not available' });

    return res.json({ access_token: makeAccessToken(user) });
  } catch (_e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const token = req.body && req.body.refresh_token ? String(req.body.refresh_token) : '';
    if (!token) return res.status(400).json({ error: 'refresh_token is required' });
    await RefreshToken.destroy({ where: { token } });
    return res.json({ message: 'Logout successful' });
  } catch (e) {
    return next(e);
  }
});

router.get('/me', auth, async (req, res) => {
  return res.json({ user: { id: req.user.id, full_name: req.user.full_name, email: req.user.email, role: req.user.role, is_active: req.user.is_active } });
});

router.patch('/profile', auth, [
  body('full_name').trim().isLength({ min: 2 }).withMessage('full_name must contain at least 2 characters')
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    req.user.full_name = String(req.body.full_name).trim();
    await req.user.save();
    return res.json({ message: 'Profile updated', user: { id: req.user.id, full_name: req.user.full_name, email: req.user.email, role: req.user.role } });
  } catch (e) {
    return next(e);
  }
});

router.patch('/change-password', auth, [
  body('old_password').notEmpty().withMessage('old_password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('new_password must contain at least 6 characters'),
  body('new_password_confirm').custom((value, { req }) => {
    if (value !== req.body.new_password) throw new Error('new_password_confirm does not match new_password');
    return true;
  })
], async (req, res, next) => {
  try {
    if (validationFailed(req, res)) return;
    const ok = await bcrypt.compare(String(req.body.old_password), req.user.password_hash);
    if (!ok) return res.status(400).json({ error: 'Old password is incorrect' });
    req.user.password_hash = await bcrypt.hash(String(req.body.new_password), 10);
    await req.user.save();
    await RefreshToken.destroy({ where: { user_id: req.user.id } });
    return res.json({ message: 'Password changed. Please log in again.' });
  } catch (e) {
    return next(e);
  }
});

router.get('/admin-only', auth, role('admin'), async (_req, res) => res.json({ message: 'Admin access granted' }));

router.delete('/users/:id', auth, role('admin'), async (req, res, next) => {
  try {
    const user = await User.findByPk(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'User not found' });
    await RefreshToken.destroy({ where: { user_id: user.id } });
    await user.destroy();
    return res.json({ message: 'User deleted' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
