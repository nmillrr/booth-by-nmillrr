/**
 * Simple test routes for testing the API without complex multipart handling
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const imageController = require('../controllers/imageController');

const router = express.Router();

// Test route for processing images
router.post('/simple-process', async (req, res, next) => {
  try {
    // Check if there's a file path in the request body
    if (!req.body.filePath) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file path provided'
        }
      });
    }
    
    const filePath = req.body.filePath;
    
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: {
          message: `File not found: ${filePath}`
        }
      });
    }
    
    // Read the file
    const fileData = fs.readFileSync(filePath);
    
    // Set up req.file as if it came from multer
    req.file = {
      fieldname: 'image',
      originalname: path.basename(filePath),
      encoding: '7bit',
      mimetype: path.extname(filePath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg',
      size: fileData.length,
      buffer: fileData,
      path: filePath
    };
    
    // Forward to the image controller
    return imageController.processImage(req, res, next);
  } catch (error) {
    next(error);
  }
});

module.exports = router;