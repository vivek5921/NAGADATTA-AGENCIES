const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const seedDatabase = require('./db/seed');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const sparePartRoutes = require('./routes/spareParts');
const settingRoutes = require('./routes/settings');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON Parsing
const corsOptions = {
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Images Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint for cloud deployment platforms (Render, Railway, AWS, etc.)
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

// Serve Frontend Build in Production (if built)
const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), err => {
    if (err) {
      res.status(200).send('Nagadatta Agencies API is running. Frontend dev server is available separately.');
    }
  });
});

// Initialize DB and Start Server
async function start() {
  try {
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`=================================================`);
      console.log(`  Nagadatta Agencies Server running on port ${PORT}`);
      console.log(`  API Base: http://localhost:${PORT}/api`);
      console.log(`=================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
}

start();
