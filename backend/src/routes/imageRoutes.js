/**
 * Image routes
 */
const express = require('express');
const imageController = require('../controllers/imageController');
const { validateFileUpload } = require('../middleware/validationMiddleware');

const router = express.Router();

/**
 * Process for handling multipart file uploads with validation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Next middleware function
 */
const handleFileUpload = (req, res, next) => {
  // Get multer from app locals
  const upload = req.app.locals.upload;
  
  // Handle file upload with multer - field name must be 'image'
  upload.single('image')(req, res, (err) => {
    if (err) {
      // Pass the error to the error handler middleware
      return next(err);
    }
    
    // Continue to next middleware
    next();
  });
};

// Process an image - accepts both JSON and multipart/form-data
router.post('/process-image', (req, res, next) => {
  // Check if request is multipart/form-data
  if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
    // Handle file upload first
    handleFileUpload(req, res, (err) => {
      if (err) return next(err);
      
      // Then validate the file
      validateFileUpload({
        required: true,
        allowedTypes: ['image/jpeg', 'image/png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        fieldName: 'image'
      })(req, res, next);
    });
  } else {
    // For JSON data, just validate normally
    validateFileUpload({
      required: true,
      allowedTypes: ['image/jpeg', 'image/png'],
      maxSize: 10 * 1024 * 1024, // 10MB
      fieldName: 'image'
    })(req, res, next);
  }
}, imageController.processImage);

// Dedicated endpoint for processing images - strictly multipart/form-data
router.post('/process', 
  handleFileUpload,
  validateFileUpload({
    required: true,
    allowedTypes: ['image/jpeg', 'image/png'],
    maxSize: 10 * 1024 * 1024, // 10MB
    fieldName: 'image'
  }),
  imageController.processImage
);

// Get all processed images
router.get('/images', imageController.getAllImages);

// Get a single image by ID
router.get('/images/:id', imageController.getImageById);

module.exports = router;