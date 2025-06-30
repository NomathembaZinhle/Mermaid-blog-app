import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Generate JWT token
const generateToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// @route   POST /api/auth/register
router.post(
  '/register',
  [
    body('username').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password } = req.body;

    try {
      const existing = await User.findOne({ email });
      if (existing) return res.status(400).json({ message: 'Email already registered' });

      const user = new User({ username, email, password });
      await user.save();

      res.status(201).json({
        user: { id: user._id, username: user.username, email: user.email },
        token: generateToken(user),
      });
    } catch (err) {
      next(err);
    }
  }
);

// @route   POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({
        user: { id: user._id, username: user.username, email: user.email },
        token: generateToken(user),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
