// Demo script to show logging functionality
const fs = require('fs');
const path = require('path');

console.log('=== CodeBolt Agent Server Logging Demo ===\n');

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log('✓ Created temp directory');
}

const logFile = path.join(tempDir, 'agent-server.log');

console.log(`Log file location: ${logFile}`);
console.log(`Relative path from project root: ${path.relative(process.cwd(), logFile)}\n`);

console.log('To monitor logs when running the server:');
console.log(`  tail -f ${logFile}`);
console.log('  # Or from project root:');
console.log(`  tail -f ${path.relative(process.cwd(), logFile)}\n`);

console.log('Example usage:');
console.log('  # Start server with TUI (logs will be written to file)');
console.log('  npm start');
console.log('  # In another terminal, monitor logs:');
console.log(`  tail -f ${logFile}\n`);

console.log('  # Start server without TUI');
console.log('  npm start -- --noui');
console.log('  # Logs will appear in both console and file\n');

// Create a sample log entry to show the format
const sampleLog = `[${new Date().toISOString()}] INFO: This is a sample log entry from the demo
[${new Date().toISOString()}] DEBUG: Debug messages include detailed information
[${new Date().toISOString()}] WARN: Warning messages for potential issues
[${new Date().toISOString()}] ERROR: Error messages for problems

`;

try {
  fs.writeFileSync(logFile, sampleLog);
  console.log('✓ Created sample log file with example entries');
  console.log('\nSample log content:');
  console.log(fs.readFileSync(logFile, 'utf8'));
} catch (error) {
  console.error('✗ Failed to create sample log:', error.message);
}