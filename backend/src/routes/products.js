const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');

const router = express.Router();

// Cloudinary config (works on local + Vercel)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Memory storage — no disk writes (Vercel-safe)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  },
});

/** Upload buffer to Cloudinary; returns secure_url */
function uploadToCloudinary(buffer, folder = 'velora/products') {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.'));
    }
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// Public: list products
router.get('/', async (req, res) => {
  try {
    const {
      search = '',
      category,
      status = 'active',
      featured,
      minPrice,
      maxPrice,
      sort = 'newest',
      page = 1,
      limit = 12,
      stock,
    } = req.query;

    const offset = (Math.max(1, parseInt(page)) - 1) * Math.min(50, parseInt(limit) || 12);
    const lim = Math.min(50, parseInt(limit) || 12);

    let where = ['p.status = $1'];
    const params = [status];
    let idx = 2;

    if (search) {
      where.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx} OR p.sku ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (category) {
      where.push(`(c.slug = $${idx} OR c.id = $${idx})`);
      params.push(category);
      idx++;
    }
    if (featured === 'true') {
      where.push('p.featured = true');
    }
    if (minPrice) {
      where.push(`p.price >= $${idx}`);
      params.push(parseFloat(minPrice));
      idx++;
    }
    if (maxPrice) {
      where.push(`p.price <= $${idx}`);
      params.push(parseFloat(maxPrice));
      idx++;
    }
    if (stock === 'low') {
      where.push('p.stock > 0 AND p.stock <= 10');
    } else if (stock === 'out') {
      where.push('p.stock = 0');
    } else if (stock === 'in') {
      where.push('p.stock > 0');
    }

    let orderBy = 'p.created_at DESC';
    if (sort === 'price_asc') orderBy = 'p.price ASC';
    else if (sort === 'price_desc') orderBy = 'p.price DESC';
    else if (sort === 'name') orderBy = 'p.name ASC';
    else if (sort === 'stock') orderBy = 'p.stock ASC';

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    params.push(lim, offset);
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    res.json({
      success: true,
      products: rows.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        categoryId: p.category_id,
        categoryName: p.category_name,
        categorySlug: p.category_slug,
        stock: p.stock,
        sku: p.sku,
        brand: p.brand,
        status: p.status,
        featured: p.featured,
        imageUrl: p.image_url,
        images: p.images || [],
        createdAt: p.created_at,
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: lim,
        totalPages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    console.error('List products error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Public: single product
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const p = rows[0];
    res.json({
      success: true,
      product: {
        id: p.id,
        name: p.name,
        description: p.description,
        price: parseFloat(p.price),
        categoryId: p.category_id,
        categoryName: p.category_name,
        categorySlug: p.category_slug,
        stock: p.stock,
        sku: p.sku,
        brand: p.brand,
        status: p.status,
        featured: p.featured,
        imageUrl: p.image_url,
        images: p.images || [],
        createdAt: p.created_at,
      },
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

// Admin: create product
router.post(
  '/',
  authenticate,
  requireAdmin,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
    body('stock').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        name,
        description,
        price,
        categoryId,
        stock = 0,
        sku,
        brand,
        status = 'active',
        featured = false,
        imageUrl,
      } = req.body;

      let finalImage = imageUrl || null;
      if (req.file) {
        finalImage = await uploadToCloudinary(req.file.buffer);
      }

      let images = [];
      if (req.body.images) {
        try {
          images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        } catch {
          images = Array.isArray(req.body.images) ? req.body.images : [];
        }
      }

      const { rows } = await pool.query(
        `INSERT INTO products (name, description, price, category_id, stock, sku, brand, status, featured, image_url, images)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          name,
          description || null,
          parseFloat(price),
          categoryId || null,
          parseInt(stock) || 0,
          sku || null,
          brand || null,
          status,
          featured === 'true' || featured === true,
          finalImage,
          images,
        ]
      );

      const p = rows[0];
      res.status(201).json({
        success: true,
        message: 'Product created',
        product: {
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          categoryId: p.category_id,
          stock: p.stock,
          sku: p.sku,
          brand: p.brand,
          status: p.status,
          featured: p.featured,
          imageUrl: p.image_url,
          images: p.images || [],
        },
      });
    } catch (err) {
      console.error('Create product error:', err);
      if (err.code === '23505') {
        return res.status(409).json({ success: false, message: 'SKU already exists' });
      }
      if (err.message && err.message.includes('Cloudinary')) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
  }
);

// Admin: update product
router.put(
  '/:id',
  authenticate,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const existing = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (existing.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      const {
        name,
        description,
        price,
        categoryId,
        stock,
        sku,
        brand,
        status,
        featured,
        imageUrl,
      } = req.body;

      let finalImage = imageUrl !== undefined ? imageUrl : existing.rows[0].image_url;
      if (req.file) {
        finalImage = await uploadToCloudinary(req.file.buffer);
      }

      let images = existing.rows[0].images || [];
      if (req.body.images) {
        try {
          images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        } catch {
          images = Array.isArray(req.body.images) ? req.body.images : images;
        }
      }

      const { rows } = await pool.query(
        `UPDATE products SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          category_id = COALESCE($4, category_id),
          stock = COALESCE($5, stock),
          sku = COALESCE($6, sku),
          brand = COALESCE($7, brand),
          status = COALESCE($8, status),
          featured = COALESCE($9, featured),
          image_url = $10,
          images = $11,
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $12
         RETURNING *`,
        [
          name || null,
          description !== undefined ? description : null,
          price !== undefined ? parseFloat(price) : null,
          categoryId !== undefined ? categoryId : null,
          stock !== undefined ? parseInt(stock) : null,
          sku || null,
          brand || null,
          status || null,
          featured !== undefined ? featured === 'true' || featured === true : null,
          finalImage,
          images,
          id,
        ]
      );

      const p = rows[0];
      res.json({
        success: true,
        message: 'Product updated',
        product: {
          id: p.id,
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          categoryId: p.category_id,
          stock: p.stock,
          sku: p.sku,
          brand: p.brand,
          status: p.status,
          featured: p.featured,
          imageUrl: p.image_url,
          images: p.images || [],
        },
      });
    } catch (err) {
      console.error('Update product error:', err);
      if (err.message && err.message.includes('Cloudinary')) {
        return res.status(500).json({ success: false, message: err.message });
      }
      res.status(500).json({ success: false, message: 'Something went wrong.' });
    }
  }
);

// Admin: delete product
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
