const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [
      productsRes,
      categoriesRes,
      usersRes,
      lowStockRes,
      featuredRes,
      recentProductsRes,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM categories'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM products WHERE stock > 0 AND stock <= 10'),
      pool.query('SELECT COUNT(*) FROM products WHERE featured = true'),
      pool.query(
        `SELECT p.id, p.name, p.price, p.stock, p.image_url, p.status, c.name as category_name
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ORDER BY p.created_at DESC
         LIMIT 5`
      ),
    ]);

    const lowStockProducts = await pool.query(
      `SELECT p.id, p.name, p.stock, p.image_url, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.stock > 0 AND p.stock <= 10
       ORDER BY p.stock ASC
       LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalProducts: parseInt(productsRes.rows[0].count),
        totalCategories: parseInt(categoriesRes.rows[0].count),
        totalUsers: parseInt(usersRes.rows[0].count),
        lowStockProducts: parseInt(lowStockRes.rows[0].count),
        featuredProducts: parseInt(featuredRes.rows[0].count),
      },
      recentProducts: recentProductsRes.rows.map((p) => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price),
        stock: p.stock,
        imageUrl: p.image_url,
        status: p.status,
        categoryName: p.category_name,
      })),
      lowStockList: lowStockProducts.rows.map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        imageUrl: p.image_url,
        categoryName: p.category_name,
      })),
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
});

module.exports = router;
