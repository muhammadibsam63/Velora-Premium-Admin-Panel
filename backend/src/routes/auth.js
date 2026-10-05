
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
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(morgan('dev'));

app.use(
  express.json({
    limit: '10mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ===============================
// API ROUTES
// ===============================

// Main API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Compatibility routes
// Frontend can use /auth/login instead of /api/auth/login
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/dashboard', dashboardRoutes);

// ===============================
// HEALTH CHECK
// ===============================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Velora API is running',
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Velora API is running',
  });
});

// ===============================
// ROOT
// ===============================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Velora API is running',
  });
});

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {
  console.error(err);

  if (
    err.name === 'MulterError' ||
    (err.message && err.message.includes('image'))
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS origin not allowed',
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// ===============================
// LOCAL DEVELOPMENT
// ===============================

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Velora backend running on http://localhost:${PORT}`);
  });
}

// ===============================
// VERCEL
// ===============================

module.exports = app;
