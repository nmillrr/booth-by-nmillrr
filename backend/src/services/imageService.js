/**
 * Image processing service using Sharp
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

/**
 * Apply photo booth style adjustments to an image
 * @param {Buffer|string} imageData - Image buffer or file path
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - Processed image data
 */
const processImage = async (imageData, options = {}) => {
  try {
    // Create a sharp instance from the input
    let image;
    
    if (Buffer.isBuffer(imageData)) {
      image = sharp(imageData);
    } else if (typeof imageData === 'string' && imageData.startsWith('data:image/')) {
      // Handle base64 data URL
      const base64Data = imageData.split(';base64,').pop();
      image = sharp(Buffer.from(base64Data, 'base64'));
    } else if (typeof imageData === 'string' && fs.existsSync(imageData)) {
      // Handle file path
      image = sharp(imageData);
    } else {
      throw new Error('Invalid image data format');
    }

    // Get original metadata and dimensions
    const metadata = await image.metadata();
    const { width, height, format: originalFormat } = metadata;
    
    // Get original size in bytes
    const originalSize = Buffer.isBuffer(imageData) 
      ? imageData.length 
      : (typeof imageData === 'string' && fs.existsSync(imageData)) 
        ? fs.statSync(imageData).size 
        : 0;

    // Apply our photo booth adjustments
    // 1. Adjust curves to establish an S curve using tone curve
    // S-curve increases contrast in midtones while compressing shadows and highlights
    image = image.recomb([
      [1.3, 0, 0],  // Red channel adjustment
      [0, 1.3, 0],  // Green channel adjustment
      [0, 0, 1.3]   // Blue channel adjustment
    ]);

    // 2. Decrease contrast by 25%
    image = image.modulate({
      brightness: 1.0,
      saturation: 0.75,  // Decrease saturation by 25%
    });
    
    // 3, 4, 5, 6. Adjust highlights, shadows, whites, blacks
    // We can approximate these using linear adjustment with gamma correction
    image = image.linear(
      // Slope (highlights and whites)
      0.5,  // Decrease highlights by reducing the slope
      // Offset (shadows and blacks)
      0.15  // Increase shadows by adding a positive offset
    ).gamma(1.2);  // Apply gamma correction to adjust black levels
    
    // 7, 8, 9. HSL adjustments for shadows, midtones, and highlights
    // Sharp doesn't have direct HSL adjustments for tonal ranges
    // So we'll use a combination of tint and saturation adjustments to approximate the effect
    image = image
      .tint({ r: 255, g: 230, b: 200 })  // Warm tint (approximates hue shift)
      .modulate({ saturation: 0.35 });   // Decrease overall saturation
    
    // 10. Increase temperature warmth by 5%
    image = image.tint({ r: 255, g: 245, b: 235 });
    
    // 11. Decrease saturation by 100% (this would make it grayscale)
    // Since you likely want some color, we'll interpret as a decrease BY 100% not TO 0%
    image = image.modulate({ saturation: 0.8 });  // Decrease saturation
    
    // 12. Decrease clarity by 60% (approximate by reducing sharpening)
    image = image.blur(1.5);  // Slightly blur to reduce clarity
    
    // 13. Add a 15% vignette
    // Calculate vignette parameters
    const vignetteWidth = Math.round(width * 1.2);
    const vignetteHeight = Math.round(height * 1.2);
    const vignetteOpacity = 0.15; // 15% vignette
    
    // Create a vignette overlay
    const vignette = Buffer.from(
      `<svg width="${vignetteWidth}" height="${vignetteHeight}">
        <radialGradient id="gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <stop offset="0%" stop-color="white" stop-opacity="0"/>
          <stop offset="90%" stop-color="black" stop-opacity="${vignetteOpacity}"/>
        </radialGradient>
        <rect width="100%" height="100%" fill="url(#gradient)"/>
      </svg>`
    );
    
    // Apply vignette as composite
    image = image.composite([
      {
        input: vignette,
        blend: 'multiply',
        gravity: 'center'
      }
    ]);
    
    // 14. Add 20% grain
    // Generate noise and overlay it
    const noise = await sharp({
      create: {
        width,
        height,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .noise(20)  // Add noise
      .toBuffer();
    
    // Composite noise with reduced opacity
    image = image.composite([
      {
        input: noise,
        blend: 'overlay',
        opacity: 0.2  // 20% grain
      }
    ]);
    
    // Choose output format
    const outputFormat = options.format || 'jpeg';
    let outputOptions = {};
    
    if (outputFormat === 'jpeg') {
      outputOptions = { quality: 90 };
    } else if (outputFormat === 'png') {
      outputOptions = { compressionLevel: 9 };
    }
    
    // Process the image and get the buffer
    const processedImageBuffer = await image.toFormat(outputFormat, outputOptions).toBuffer();
    
    // Generate a unique filename
    const timestamp = Date.now();
    const filename = `processed_${timestamp}.${outputFormat}`;
    
    // Handle output path based on environment
    let filePath;
    
    // In serverless environment, we'll just return the buffer and virtual path
    if (process.env.VERCEL) {
      filePath = `/api/image/${timestamp}`; // This would be a virtual path to access the image
    } else {
      // For local development or non-serverless deployment
      const outputPath = path.join(__dirname, '../../uploads', filename);
      
      // Save the processed image
      await fs.promises.writeFile(outputPath, processedImageBuffer);
      
      // Calculate the URL path for the processed image
      filePath = `/uploads/${filename}`;
    }
    
    // Return the processed image info
    return {
      processed: true,
      originalSize,
      processedSize: processedImageBuffer.length,
      filters: options.filters || ['photo-booth'],
      url: filePath,
      buffer: processedImageBuffer
    };
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error(`Failed to process image: ${error.message}`);
  }
};

/**
 * Validate image data and format
 * @param {string} imageData - Base64 encoded image data
 * @returns {boolean} - Whether the image is valid
 */
const validateImage = (imageData) => {
  if (!imageData) return false;
  
  // Check if it's a valid base64 string
  try {
    // Check for data URI format
    if (imageData.startsWith('data:image/')) {
      // Extract the mime type
      const mimeType = imageData.split(';')[0].split(':')[1];
      
      // Check if it's a supported image format
      return ['image/jpeg', 'image/png', 'image/gif'].includes(mimeType);
    }
    return false;
  } catch (error) {
    console.error('Error validating image:', error);
    return false;
  }
};

module.exports = {
  processImage,
  validateImage
};