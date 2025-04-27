/**
 * Server debug utility
 * 
 * This script helps diagnose common issues with the server
 */
const http = require('http');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===================================');
console.log('SERVER DEBUGGING UTILITY');
console.log('===================================\n');

// Check Node.js version
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${os.platform()} ${os.release()}`);

// Check if config file exists and is valid
try {
  const configPath = path.join(__dirname, 'src/config/app.js');
  console.log(`\nChecking config file: ${configPath}`);
  
  if (fs.existsSync(configPath)) {
    console.log('✅ Config file exists');
    
    // Check if the config is valid
    try {
      const config = require('./src/config/app.js');
      console.log('✅ Config file is valid');
      console.log(`   Port: ${config.port}`);
      console.log(`   Environment: ${config.env}`);
    } catch (error) {
      console.log('❌ Config file has errors:');
      console.log(error.message);
    }
  } else {
    console.log('❌ Config file does not exist');
  }
} catch (error) {
  console.log('❌ Error checking config file:', error.message);
}

// Check dependencies
console.log('\nChecking dependencies:');
try {
  const pkg = require('./package.json');
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  
  console.log('✅ Dependencies found in package.json');
  
  // Check express
  if (deps.express) {
    console.log(`   Express: ${deps.express}`);
  } else {
    console.log('❌ Express not found in dependencies');
  }
  
  // Check multer
  if (deps.multer) {
    console.log(`   Multer: ${deps.multer}`);
  } else {
    console.log('❌ Multer not found in dependencies');
  }
  
  // Check express-fileupload
  if (deps['express-fileupload']) {
    console.log(`   express-fileupload: ${deps['express-fileupload']}`);
  } else {
    console.log('❌ express-fileupload not found in dependencies');
  }
} catch (error) {
  console.log('❌ Error checking dependencies:', error.message);
}

// Check port
console.log('\nChecking ports:');
const portsToCheck = [3000, 3001, 3002, 8080];

portsToCheck.forEach(port => {
  try {
    // Create a test server to check if the port is available
    const server = http.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`❌ Port ${port} is already in use`);
        
        try {
          // Try to get more info about what's using the port (Unix-like systems only)
          if (os.platform() !== 'win32') {
            const lsofOutput = execSync(`lsof -i :${port} || echo "No process found"`).toString();
            console.log(`   Port ${port} is used by:\n${lsofOutput}`);
          }
        } catch (e) {
          // Ignore lsof errors
        }
      } else {
        console.log(`❌ Error checking port ${port}: ${err.message}`);
      }
    });
    
    server.once('listening', () => {
      // If we get here, the port is available
      console.log(`✅ Port ${port} is available`);
      server.close();
    });
    
    server.listen(port);
  } catch (error) {
    console.log(`❌ Error checking port ${port}:`, error.message);
  }
});

// Check uploads directory
console.log('\nChecking uploads directory:');
const uploadsDir = path.join(__dirname, 'uploads');

try {
  if (fs.existsSync(uploadsDir)) {
    console.log(`✅ Uploads directory exists: ${uploadsDir}`);
    
    // Check permissions
    try {
      fs.accessSync(uploadsDir, fs.constants.R_OK | fs.constants.W_OK);
      console.log('✅ Uploads directory is readable and writable');
    } catch (error) {
      console.log('❌ Permission issues with uploads directory:', error.message);
    }
  } else {
    console.log(`❌ Uploads directory does not exist: ${uploadsDir}`);
    
    // Try to create it
    try {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    } catch (error) {
      console.log('❌ Failed to create uploads directory:', error.message);
    }
  }
} catch (error) {
  console.log('❌ Error checking uploads directory:', error.message);
}

// Check network
console.log('\nChecking network:');

// Check localhost
const checkLocalhost = new Promise((resolve) => {
  const req = http.get('http://localhost:3001', (res) => {
    console.log(`✅ Localhost is reachable, status: ${res.statusCode}`);
    resolve();
  });
  
  req.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
      console.log('❌ Localhost:3001 connection refused - server not running');
    } else {
      console.log(`❌ Localhost connection error: ${err.message}`);
    }
    resolve();
  });
  
  req.setTimeout(1000, () => {
    req.destroy();
    console.log('❌ Localhost connection timeout');
    resolve();
  });
});

// Final recommendations
checkLocalhost.then(() => {
  console.log('\n===================================');
  console.log('RECOMMENDATIONS:');
  console.log('===================================');
  console.log('1. Try running the server with: npm run dev');
  console.log('2. Check for error messages in the console');
  console.log('3. Make sure no other service is using the same port');
  console.log('4. Try using a different port in src/config/app.js');
  console.log('5. Ensure all dependencies are installed with: npm install');
  console.log('===================================');
});