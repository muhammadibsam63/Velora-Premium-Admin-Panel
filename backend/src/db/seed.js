require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('./pool');

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Demo Admin (password: Admin@12345)
    const adminHash = await bcrypt.hash('Admin@12345', 12);
    await client.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
      ['Velora Admin', 'admin@velora.com', adminHash, 'ADMIN']
    );

    // Demo User (password: User@12345)
    const userHash = await bcrypt.hash('User@12345', 12);
    await client.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
      ['Demo User', 'user@velora.com', userHash, 'USER']
    );

    // Categories
    const categories = [
      { name: 'Electronics', description: 'Latest gadgets and devices', slug: 'electronics', featured: true },
      { name: 'Fashion', description: 'Premium clothing and accessories', slug: 'fashion', featured: true },
      { name: 'Home & Living', description: 'Elegant home essentials', slug: 'home-living', featured: false },
      { name: 'Beauty', description: 'Luxury beauty products', slug: 'beauty', featured: true },
      { name: 'Sports', description: 'Performance sports gear', slug: 'sports', featured: false },
    ];

    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (name, description, slug, featured, status)
         VALUES ($1, $2, $3, $4, 'active')
         ON CONFLICT (slug) DO NOTHING`,
        [cat.name, cat.description, cat.slug, cat.featured]
      );
    }

    // Get category ids
    const { rows: cats } = await client.query('SELECT id, slug FROM categories');
    const catMap = {};
    cats.forEach((c) => (catMap[c.slug] = c.id));

    // Products
    const products = [
      {
        name: 'Aurora Wireless Headphones',
        description: 'Premium noise-cancelling headphones with 40h battery life and spatial audio.',
        price: 249.99,
        category: 'electronics',
        stock: 45,
        sku: 'VEL-HD-001',
        brand: 'Velora Audio',
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      },
      {
        name: 'Nova Smart Watch Pro',
        description: 'Advanced health tracking, AMOLED display, and 7-day battery.',
        price: 399.00,
        category: 'electronics',
        stock: 28,
        sku: 'VEL-SW-002',
        brand: 'Velora Tech',
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
      },
      {
        name: 'Luxe Leather Jacket',
        description: 'Handcrafted genuine leather jacket with modern slim fit.',
        price: 289.50,
        category: 'fashion',
        stock: 15,
        sku: 'VEL-FJ-003',
        brand: 'Velora Atelier',
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
      },
      {
        name: 'Minimalist Desk Lamp',
        description: 'Adjustable LED desk lamp with wireless charging base.',
        price: 79.99,
        category: 'home-living',
        stock: 60,
        sku: 'VEL-HL-004',
        brand: 'Velora Home',
        featured: false,
        image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800',
      },
      {
        name: 'Velvet Night Serum',
        description: 'Anti-aging night serum with retinol and hyaluronic acid.',
        price: 68.00,
        category: 'beauty',
        stock: 8,
        sku: 'VEL-BT-005',
        brand: 'Velora Beauty',
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1620916568499-8b4c0c0c0c0c?w=800',
      },
      {
        name: 'Performance Running Shoes',
        description: 'Lightweight carbon-plated running shoes for elite performance.',
        price: 179.00,
        category: 'sports',
        stock: 32,
        sku: 'VEL-SP-006',
        brand: 'Velora Sport',
        featured: false,
        image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
      },
      {
        name: 'Carbon Fiber Backpack',
        description: 'Ultra-light durable backpack with laptop compartment and USB port.',
        price: 129.99,
        category: 'fashion',
        stock: 22,
        sku: 'VEL-BP-007',
        brand: 'Velora Gear',
        featured: false,
        image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
      },
      {
        name: 'Smart Coffee Maker',
        description: 'App-controlled pour-over coffee maker with temperature precision.',
        price: 199.00,
        category: 'home-living',
        stock: 5,
        sku: 'VEL-CM-008',
        brand: 'Velora Home',
        featured: true,
        image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
      },
    ];

    for (const p of products) {
      await client.query(
        `INSERT INTO products (name, description, price, category_id, stock, sku, brand, featured, status, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9)
         ON CONFLICT (sku) DO NOTHING`,
        [
          p.name,
          p.description,
          p.price,
          catMap[p.category],
          p.stock,
          p.sku,
          p.brand,
          p.featured,
          p.image_url,
        ]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Seed completed successfully');
    console.log('Admin login: admin@velora.com / Admin@12345');
    console.log('User login:  user@velora.com / User@12345');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
