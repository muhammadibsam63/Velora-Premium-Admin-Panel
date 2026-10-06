require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const dashboardRoutes = require('./routes/dashboard');

const app = express();

// ================================
// MIDDLEWARE
// ================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(morgan('dev'));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ================================
// HEALTH CHECK
// ================================

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Velora API is running',
  });
});

// ================================
// API ROUTES
// ================================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ================================
// ROOT ROUTE
// ================================

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Velora Backend API is running',
  });
});

// ================================
// 404 HANDLER
// ================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ================================
// ERROR HANDLER
// ================================

app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  if (
    err.name === 'MulterError' ||
    (err.message && err.message.toLowerCase().includes('image'))
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ================================
// VERCEL EXPORT
// ================================

module.exports = app;

// ================================
// LOCAL DEVELOPMENT
// ================================

if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Velora backend running on http://localhost:${PORT}`);
  });
}