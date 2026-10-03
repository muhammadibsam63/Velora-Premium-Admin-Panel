# Velora — Premium Full-Stack E-Commerce

Dark, futuristic, premium e-commerce platform built with **React + Vite** (frontend) and **Node.js + Express + Neon PostgreSQL** (backend).

## Project Structure

```
velora-full/
├── backend/
│   ├── src/
│   │   ├── db/          # pool, migrate, seed
│   │   ├── middleware/  # auth + admin role
│   │   ├── routes/      # auth, products, categories, dashboard
│   │   └── index.js
│   ├── uploads/         # product images
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbar, ProtectedRoute, PageTransition
│   │   ├── context/     # AuthContext
│   │   ├── pages/       # Home, Login, Signup, Products, ProductDetail, Categories, admin/*
│   │   ├── styles/
│   │   └── utils/api.js
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js 18+
- A Neon PostgreSQL database (free tier works)

## 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env and set:
# DATABASE_URL=your_neon_connection_string
# JWT_SECRET=a_long_random_secret
# FRONTEND_URL=http://localhost:5173

npm install
npm run migrate
npm run seed
npm run dev
```

Backend runs at **http://localhost:5000**

### Default accounts (after seed)

| Role  | Email             | Password    |
|-------|-------------------|------------|
| Admin | admin@velora.com  | Admin@12345|
| User  | user@velora.com   | User@12345 |

To promote any user to admin:

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

## 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

Vite proxies `/api` and `/uploads` to the backend.

## Environment Variables (Backend)

| Variable       | Description                          |
|----------------|--------------------------------------|
| PORT           | Default 5000                         |
| DATABASE_URL   | Neon PostgreSQL connection string    |
| JWT_SECRET     | Secret for signing JWTs              |
| JWT_EXPIRES_IN | e.g. 7d                              |
| FRONTEND_URL   | CORS origin (http://localhost:5173)  |
| NODE_ENV       | development / production             |

## Features

- JWT authentication + role-based access (ADMIN / USER)
- Backend enforces ADMIN on all CRUD endpoints
- Premium dark Login / Signup with GSAP animations
- Home with featured products from real DB
- Product listing, search, detail
- Category listing
- Admin dashboard with live stats
- Product CRUD (name, description, price, category, stock, SKU, brand, status, featured, image URL or file upload)
- Category CRUD
- Responsive design
- Toast notifications
- Skeleton loaders

## API Overview

- `POST /api/auth/signup` – create user
- `POST /api/auth/login` – login
- `GET  /api/auth/me` – current user (auth)
- `GET  /api/products` – list (public, filters)
- `GET  /api/products/:id` – detail
- `POST /api/products` – create (admin + multipart)
- `PUT  /api/products/:id` – update (admin)
- `DELETE /api/products/:id` – delete (admin)
- `GET/POST/PUT/DELETE /api/categories` – same pattern
- `GET  /api/dashboard/stats` – admin stats

## Notes

- Image uploads are stored in `backend/uploads` and served at `/uploads/...`
- All dynamic data comes from Neon — no mock data.
- Frontend never receives secrets.
- For production: set strong JWT_SECRET, use HTTPS, configure Neon connection pooling.

© 2026 Velora
