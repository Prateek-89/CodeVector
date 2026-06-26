const express = require('express');
const cors = require('cors');
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();

// --- Global Middleware ---

// CORS — allow frontend from any origin during development
app.use(cors());

// Body parsing
app.use(express.json({ limit: '1mb' }));

// --- Routes ---

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Product routes
app.use('/api/products', productRoutes);

// Category routes
app.use('/api/categories', categoryRoutes);

// --- Error Handling ---

// 404 for unknown routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Centralized error handler (must be last)
app.use(errorHandler);

module.exports = app;