/**
 * Server entry point
 */
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const config = require('./config/app');
const imageRoutes = require('./routes/imageRoutes');
const testRoutes = require('./routes/testRoutes');
const errorHandler = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const port = config.port;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

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

// Define the maximum file size (10MB)
const maxFileSize = config.maxFileSize ? parseInt(config.maxFileSize) : 10 * 1024 * 1024;

const upload = multer({ 
  storage, 
  fileFilter,
  limits: { 
    fileSize: maxFileSize,
    files: 1 // Only allow one file per request
  }
});

// Middleware
app.use(cors(config.cors));
app.use(express.json({ limit: config.maxFileSize }));

// File upload middleware
app.use(fileUpload({
  limits: { fileSize: maxFileSize }, // Use the same limit as multer
  useTempFiles: true,
  tempFileDir: '/tmp/',
  abortOnLimit: true,
  createParentPath: true,
  debug: process.env.NODE_ENV === 'development',
  safeFileNames: true,
  preserveExtension: true,
  uploadTimeout: 30000 // 30 seconds timeout
}));

// Make the uploads directory accessible for development (remove in production)
app.use('/uploads', express.static(uploadsDir));

// Welcome route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to the Photo Booth API',
    version: '1.0.0',
    status: 'online' 
  });
});

// Set upload middleware in app locals for routes to use
app.locals.upload = upload;

// API routes
app.use('/api', imageRoutes);

// Testing routes
app.use('/test', testRoutes);

// API root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Photo Booth API',
    version: '1.0.0',
    status: 'online',
    endpoints: [
      '/api/process',
      '/api/process-image',
      '/api/images',
      '/api/images/:id',
      '/test/simple-process'
    ]
  });
});

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

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} in ${config.env} mode`);
  console.log(`Uploads directory: ${uploadsDir}`);
  console.log(`API URL: http://localhost:${port}/api`);
})
.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use. Trying port ${port + 1}...`);
    // Try alternate port
    app.listen(port + 1, '0.0.0.0', () => {
      console.log(`Server running on alternate port ${port + 1} in ${config.env} mode`);
      console.log(`Uploads directory: ${uploadsDir}`);
      console.log(`API URL: http://localhost:${port + 1}/api`);
    });
  } else {
    console.error('Server error:', err);
  }
});