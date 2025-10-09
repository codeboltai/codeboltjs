// Test script to verify log file creation
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing log file creation...');

// Start the server in noui mode for testing
const serverProcess = spawn('node', ['dist/server.mjs', '--noui', '--port', '3002'], {
  stdio: 'pipe',
  cwd: __dirname
});

let serverOutput = '';
let logFileFound = false;

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log('Server output:', output);
  
  // Check for log file path in output
  if (output.includes('Log file:')) {
    const match = output.match(/Log file: (.+)/);
    if (match) {
      const logPath = match[1].trim();
      console.log(`Expected log file path: ${logPath}`);
      
      // Check if file exists after a short delay
      setTimeout(() => {
        if (fs.existsSync(logPath)) {
          console.log('✓ Log file created successfully!');
          const stats = fs.statSync(logPath);
          console.log(`  File size: ${stats.size} bytes`);
          console.log(`  Content preview:`);
          console.log(fs.readFileSync(logPath, 'utf8').split('\n').slice(0, 5).join('\n'));
          logFileFound = true;
        } else {
          console.log('✗ Log file not found');
        }
        
        // Clean up
        serverProcess.kill();
      }, 2000);
    }
  }
});

serverProcess.stderr.on('data', (data) => {
  console.error('Server error:', data.toString());
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  if (!logFileFound) {
    // Check alternative locations
    const possiblePaths = [
      path.join(__dirname, 'temp', 'agent-server.log'),
      path.join(process.cwd(), 'temp', 'agent-server.log'),
      '/tmp/agent-server.log',
      path.join(process.env.HOME || '', 'agent-server.log')
    ];
    
    console.log('\nChecking alternative log file locations:');
    possiblePaths.forEach(p => {
      if (fs.existsSync(p)) {
        console.log(`✓ Found log file at: ${p}`);
        const stats = fs.statSync(p);
        console.log(`  File size: ${stats.size} bytes`);
      } else {
        console.log(`✗ Not found: ${p}`);
      }
    });
  }
});

// Timeout after 10 seconds
setTimeout(() => {
  if (!logFileFound) {
    console.log('Timeout: Log file not found within 10 seconds');
    serverProcess.kill();
  }
}, 10000);