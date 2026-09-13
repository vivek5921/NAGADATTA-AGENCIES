const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const sparePartRoutes = require('./routes/spareParts');
const settingRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');

const app = express();

// Enable CORS and JSON Parsing
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Uploaded Images Statically (fallback for legacy local dev files)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint for cloud deployment platforms (Vercel, Render, Railway, AWS)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'Nagadatta Agencies API'
  });
});

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/spare-parts', sparePartRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/upload', uploadRoutes);

// Serve Frontend Build in Monolithic / Production Mode (if dist exists)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      res.status(200).json({
        message: 'Nagadatta Agencies API is running. Client build static files not found at root path.'
      });
    }
  });
});

module.exports = app;
