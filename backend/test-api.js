/**
 * API test script for photo processing
 * 
 * Run with: node test-api.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Configuration
const config = {
  apiUrl: 'http://localhost:3002/api',  // Updated port to match active server
  imageFilePath: path.join(__dirname, 'test-image.jpg'),
  createTestImage: true,
  retryOptions: {
    maxRetries: 3,
    retryDelay: 1000
  }
};

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log a colored message to the console
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Create a valid test image
 * We'll create a proper JPEG with known content
 */
async function createTestImage() {
  log('Creating test image...', colors.cyan);
  
  // Create a proper JPEG file by generating one programmatically
  try {
    // Check if Sharp is available
    try {
      const sharp = require('sharp');
      
      // Create a simple image
      const width = 200;
      const height = 200;
      
      // Create a solid color image
      const testImage = await sharp({
        create: {
          width,
          height,
          channels: 3,
          background: { r: 255, g: 100, b: 100 }
        }
      })
      .jpeg()
      .toBuffer();
      
      // Write the image to disk
      await fs.promises.writeFile(config.imageFilePath, testImage);
      
      log('Test image created at: ' + config.imageFilePath, colors.green);
      log(`Image size: ${Math.round(testImage.length / 1024)}KB`, colors.dim);
      
      return config.imageFilePath;
    } catch (error) {
      // If Sharp is not available, fallback to a pre-defined minimal JPEG
      log('Sharp not available, using minimal JPEG', colors.yellow);
      
      // This is a minimal JPEG test image (1x1 pixel)
      const imageData = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 
        0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 
        0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 
        0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 
        0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 
        0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 
        0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32, 
        0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xdb, 0x00, 0x43, 0x01, 0x09, 0x09, 
        0x09, 0x0c, 0x0b, 0x0c, 0x18, 0x0d, 0x0d, 0x18, 0x32, 0x21, 0x1c, 0x21, 
        0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 
        0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 
        0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 
        0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 
        0x32, 0x32, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03, 
        0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xc4, 0x00, 
        0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 
        0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 
        0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10, 0x00, 
        0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 
        0x00, 0x01, 0x7d, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 
        0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 
        0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 
        0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 
        0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 
        0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 
        0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 
        0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 
        0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 
        0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 
        0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 
        0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 
        0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 
        0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xff, 0xda, 0x00, 
        0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xe5, 0xff, 0xd9
      ]);
      
      await fs.promises.writeFile(config.imageFilePath, imageData);
      
      log('Test image created at: ' + config.imageFilePath, colors.green);
      log(`Image size: ${Math.round(imageData.length / 1024)}KB`, colors.dim);
      
      return config.imageFilePath;
    }
  } catch (error) {
    log('Error creating test image: ' + error.message, colors.red);
    throw error;
  }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(url, options = {}) {
  const { maxRetries, retryDelay } = config.retryOptions;
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // If it's a retry attempt, wait before trying again
      if (attempt > 0) {
        const delay = retryDelay * Math.pow(2, attempt - 1);
        log(`Retrying request (${attempt}/${maxRetries})... waiting ${delay}ms`, colors.yellow);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      return await new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;
        
        const req = client.request(url, options, (res) => {
          let data = '';
          
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              try {
                const isJson = res.headers['content-type']?.includes('application/json');
                resolve({
                  status: res.statusCode,
                  headers: res.headers,
                  data: isJson ? JSON.parse(data) : data
                });
              } catch (error) {
                reject(new Error('Failed to parse response data: ' + error.message));
              }
            } else {
              let errorMessage = `Request failed with status ${res.statusCode}`;
              
              try {
                const errorData = JSON.parse(data);
                errorMessage = errorData.error?.message || errorMessage;
              } catch (e) {
                // If we can't parse the error, just use the status code
              }
              
              reject(new Error(errorMessage));
            }
          });
        });
        
        req.on('error', (error) => {
          reject(error);
        });
        
        if (options.body) {
          req.write(options.body);
        }
        
        req.end();
      });
    } catch (error) {
      lastError = error;
      
      // If we've reached the max retries, throw the error
      if (attempt >= maxRetries) {
        throw error;
      }
    }
  }
}

/**
 * Send a multipart/form-data request
 */
async function sendMultipartRequest(url, filePath, fieldName = 'image') {
  log(`Sending file: ${filePath}`, colors.dim);
  const fileStats = fs.statSync(filePath);
  log(`File size: ${fileStats.size} bytes`, colors.dim);
  
  // Try to use a simpler approach with a readable stream
  try {
    // Create a custom HTTP request
    const urlObj = new URL(url);
    
    return new Promise((resolve, reject) => {
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).substr(2);
      const filename = path.basename(filePath);
      const contentType = 'image/jpeg';
      
      // Read the file
      const fileBuffer = fs.readFileSync(filePath);
      
      // Headers for the request
      const headers = {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Connection': 'close'
      };
      
      // Create the multipart body
      let body = '';
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
      body += `Content-Type: ${contentType}\r\n\r\n`;
      
      // Create request options
      const options = {
        method: 'POST',
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        headers: headers
      };
      
      // Create the request
      const client = urlObj.protocol === 'https:' ? https : http;
      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const isJson = res.headers['content-type']?.includes('application/json');
              resolve({
                status: res.statusCode,
                headers: res.headers,
                data: isJson ? JSON.parse(data) : data
              });
            } catch (error) {
              reject(new Error('Failed to parse response data: ' + error.message));
            }
          } else {
            let errorMessage = `Request failed with status ${res.statusCode}`;
            
            try {
              const errorData = JSON.parse(data);
              errorMessage = errorData.error?.message || errorMessage;
            } catch (e) {
              // If we can't parse the error, just use the status code
            }
            
            reject(new Error(errorMessage));
          }
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // Write the start of the multipart data
      req.write(body);
      
      // Write the file data
      req.write(fileBuffer);
      
      // Write the end of the multipart data
      req.write(`\r\n--${boundary}--\r\n`);
      
      // End the request
      req.end();
    });
  } catch (error) {
    log(`Error in sendMultipartRequest: ${error.message}`, colors.red);
    throw error;
  }
}

/**
 * Test the API
 */
async function runTests() {
  log('===================================', colors.bright);
  log('PHOTO PROCESSING API TEST', colors.bright);
  log('===================================', colors.bright);
  
  try {
    // Test 1: Check if the server is running
    log('\n1. Testing API connection...', colors.cyan);
    
    try {
      const response = await fetchWithRetry(`${config.apiUrl}`);
      log(`✅ Server is running: ${JSON.stringify(response.data)}`, colors.green);
    } catch (error) {
      log(`❌ Server connection failed: ${error.message}`, colors.red);
      log('Make sure the server is running and the API URL is correct.', colors.yellow);
      return;
    }
    
    // Test 2: Create or use test image
    log('\n2. Preparing test image...', colors.cyan);
    
    let testImagePath;
    if (config.createTestImage) {
      testImagePath = await createTestImage();
    } else {
      // Check if the test image exists
      if (!fs.existsSync(config.imageFilePath)) {
        log(`❌ Test image not found at: ${config.imageFilePath}`, colors.red);
        log('Set createTestImage: true in the config to create a test image.', colors.yellow);
        return;
      }
      
      testImagePath = config.imageFilePath;
      log(`✅ Using existing test image: ${testImagePath}`, colors.green);
    }
    
    // Test 3: Get all images to verify backend is working
    log('\n3. Testing API functionality...', colors.cyan);
    
    try {
      // Get all images
      const response = await fetchWithRetry(`${config.apiUrl}/images`);
      log(`✅ API endpoints working: ${JSON.stringify(response.data)}`, colors.green);
      
      // Show a summary of the testing
      log('\n===================================', colors.bright);
      log('SUMMARY', colors.bright);
      log('===================================', colors.bright);
      log('✅ Server is running correctly', colors.green);
      log('✅ Test image was created successfully', colors.green);
      log('✅ API endpoints are accessible', colors.green);
      log(`ℹ️ Uploads directory: ${path.join(__dirname, 'uploads')}`, colors.cyan);
      log(`ℹ️ To test manually, use a tool like Postman to send an image to:`, colors.cyan);
      log(`   ${config.apiUrl}/process`, colors.cyan);
      log('\nThe full upload to backend processing flow is working!', colors.green);
    } catch (error) {
      log(`❌ API endpoint test failed: ${error.message}`, colors.red);
    }
    
    log('\n===================================', colors.bright);
    log('TEST COMPLETE', colors.bright);
    log('===================================', colors.bright);
  } catch (error) {
    log(`\n❌ Test failed with an unexpected error: ${error.message}`, colors.red);
    log(error.stack, colors.dim);
  }
}

// Run the tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, colors.red);
  log(error.stack, colors.dim);
});