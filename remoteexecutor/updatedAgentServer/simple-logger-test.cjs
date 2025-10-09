// Simple test to check where the log file gets created
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Testing current working directory and log file creation...');

// Start server briefly to see where it creates the log file
const serverProcess = spawn('node', ['dist/server.mjs', '--noui', '--port', '3003'], {
  stdio: 'pipe',
  cwd: __dirname
});

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Log file:')) {
    const match = output.match(/Log file: (.+)/);
    if (match) {
      const logPath = match[1].trim();
      console.log(`\n✓ Server will create log file at: ${logPath}`);
      console.log(`  Current working directory: ${process.cwd()}`);
      console.log(`  Script directory: ${__dirname}`);
      console.log(`  Expected path: ${path.join(__dirname, 'temp', 'agent-server.log')}`);
      
      // Create the temp directory manually to ensure it exists
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
        console.log(`\n✓ Created temp directory: ${tempDir}`);
      }
      
      console.log(`\nYou can now run the server and monitor logs with:`);
      console.log(`  tail -f ${logPath}`);
      console.log(`\nOr from the project root:`);
      console.log(`  tail -f ${path.relative(process.cwd(), logPath)}`);
    }
    serverProcess.kill();
  }
});

// Kill after 5 seconds
setTimeout(() => {
  serverProcess.kill();
}, 5000);