import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Category from '../models/Category.js';

const router = express.Router();

// GET /api/posts - get all posts
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find().populate('category').sort('-createdAt');
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id - get post by ID
router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid post ID'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findById(req.params.id).populate('category');
      if (!post) return res.status(404).json({ message: 'Post not found' });
      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/posts - create a new post
router.post(
  '/',
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  body('author').trim().notEmpty().withMessage('Author is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      // Check if category exists
      const category = await Category.findById(req.body.category);
      if (!category) return res.status(400).json({ message: 'Category not found' });

      const post = new Post({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        author: req.body.author,
      });

      await post.save();
      const populatedPost = await post.populate('category');
      res.status(201).json(populatedPost);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id - update post
router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().trim().notEmpty().withMessage('Content cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category ID is required'),
  body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const updateData = {};
      ['title', 'content', 'category', 'author'].forEach(field => {
        if (req.body[field]) updateData[field] = req.body[field];
      });

      // If category provided, verify it exists
      if (updateData.category) {
        const category = await Category.findById(updateData.category);
        if (!category) return res.status(400).json({ message: 'Category not found' });
      }

      const post = await Post.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('category');
      if (!post) return res.status(404).json({ message: 'Post not found' });

      res.json(post);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/posts/:id - delete post
router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid post ID'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findByIdAndDelete(req.params.id);
      if (!post) return res.status(404).json({ message: 'Post not found' });

      res.json({ message: 'Post deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
