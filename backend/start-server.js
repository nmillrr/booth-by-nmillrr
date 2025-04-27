/**
 * Server starter script with enhanced error handling
 */
const { spawn } = require('child_process');
const path = require('path');

console.log('Starting server with enhanced error handling...');

// Get the server file path
const serverPath = path.join(__dirname, 'src/index.js');

// Spawn the server process
const server = spawn('node', [serverPath], {
  stdio: ['inherit', 'pipe', 'pipe']
});

// Handle output
server.stdout.on('data', (data) => {
  console.log(`[SERVER]: ${data.toString().trim()}`);
});

// Log any errors
server.stderr.on('data', (data) => {
  console.error(`[ERROR]: ${data.toString().trim()}`);
});

// Handle process exit
server.on('close', (code) => {
  if (code !== 0) {
    console.error(`Server process exited with code ${code}`);
  }
});

// Handle process errors
server.on('error', (error) => {
  console.error(`Failed to start server: ${error.message}`);
});

console.log(`Server process started with PID: ${server.pid}`);

// Set up for graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});