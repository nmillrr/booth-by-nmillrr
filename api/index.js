/**
 * Serverless entry point for the API
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const os = require('os');
const imageRoutes = require('../backend/src/routes/imageRoutes');
const errorHandler = require('../backend/src/middleware/errorHandler');

/**
 * Privacy Policy Notice:
 * 
 * Photos uploaded to Booth by nmillrr are only temporarily processed for styling purposes 
 * and are automatically deleted after 24 hours. We do not store, share, or use your images
 * for any other purpose. No personal data is collected during processing.
 * 
 * In serverless environments, images are processed in memory and are not persisted
 * beyond the lifecycle of the function execution, which is typically seconds.
 */

// Initialize Express app
const app = express();

// Vercel has a body size limit, adjust this as needed
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

// Configure temporary directory for file uploads
const tmpDir = os.tmpdir();

// Configure multer for file uploads (in-memory storage for serverless)
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (req, file, cb) => {
  // Accept only jpeg and png
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    const error = new Error('Unsupported file type. Only JPEG and PNG images are allowed.');
    error.statusCode = 415; // Unsupported Media Type
    cb(error, false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow one file per request
  }
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: MAX_FILE_SIZE }));

// Create uploads directory inside tmp (used for serverless functions)
const uploadsDir = path.join(tmpDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set upload middleware in app locals for routes to use
app.locals.upload = upload;
app.locals.uploadsDir = uploadsDir;

// API root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Photo Booth API',
    version: '1.0.0',
    status: 'online',
    serverless: true,
    endpoints: [
      '/api/process',
      '/api/process-image',
      '/api/images',
      '/api/images/:id'
    ]
  });
});

// API routes
app.use('/', imageRoutes);

// Not found handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: {
      message: `Route not found: ${req.originalUrl || req.url}`
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// Export the Express app as serverless function
module.exports = app;