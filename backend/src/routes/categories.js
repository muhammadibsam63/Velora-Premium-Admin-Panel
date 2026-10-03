const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');

// Public list
router.get('/', async (req, res) => {
  try {
    const { search = '', status = 'active', featured } = req.query;
    let where = ["status = $1"];
    const params = [status];
    let idx = 2;

    if (search) {
      where.push(`(name ILIKE $${idx} OR description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (featured === 'true') {
      where.push('featured = true');
    }

    const { rows } = await pool.query(
      `SELECT * FROM categories WHERE ${where.join(' AND ')} ORDER BY name ASC`,
      params
    );

    res.json({
      success: true,
      categories: rows.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        slug: c.slug,
        imageUrl: c.image_url,
        status: c.status,
        featured: c.featured,
        createdAt: c.created_at,
      })),
    });
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Public single
router.get('/:idOrSlug', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM categories WHERE id::text = $1 OR slug = $1`,
      [req.params.idOrSlug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const c = rows[0];
    res.json({
      success: true,
      category: {
        id: c.id,
        name: c.name,
        description: c.description,
        slug: c.slug,
        imageUrl: c.image_url,
        status: c.status,
        featured: c.featured,
      },
    });
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Admin create
router.post(
  '/',
  authenticate,
  requireAdmin,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, description, slug, imageUrl, status = 'active', featured = false } = req.body;
      const finalSlug = slug || slugify(name);

      const { rows } = await pool.query(
        `INSERT INTO categories (name, description, slug, image_url, status, featured)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [name, description || null, finalSlug, imageUrl || null, status, featured === true || featured === 'true']
      );

      const c = rows[0];
      res.status(201).json({
        success: true,
        message: 'Category created',
        category: {
          id: c.id,
          name: c.name,
          description: c.description,
          slug: c.slug,
          imageUrl: c.image_url,
          status: c.status,
          featured: c.featured,
        },
      });
    } catch (err) {
      console.error('Create category error:', err);
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'Category name or slug already exists' });
      }
      res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
  }
);

// Admin update
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const { name, description, slug, imageUrl, status, featured } = req.body;

    const { rows } = await pool.query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        slug = COALESCE($3, slug),
        image_url = COALESCE($4, image_url),
        status = COALESCE($5, status),
        featured = COALESCE($6, featured),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [
        name || null,
        description !== undefined ? description : null,
        slug || null,
        imageUrl !== undefined ? imageUrl : null,
        status || null,
        featured !== undefined ? featured === true || featured === 'true' : null,
        id,
      ]
    );

    const c = rows[0];
    res.json({
      success: true,
      message: 'Category updated',
      category: {
        id: c.id,
        name: c.name,
        description: c.description,
        slug: c.slug,
        imageUrl: c.image_url,
        status: c.status,
        featured: c.featured,
      },
    });
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Admin delete
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING id', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
