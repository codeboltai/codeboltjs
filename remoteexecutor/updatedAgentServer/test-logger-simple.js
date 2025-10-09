// Simple test to verify the logger source code
const fs = require('fs');
const path = require('path');

console.log('Testing logger source code...');

// Check if logger file exists
const loggerPath = path.join(__dirname, 'src/utils/logger.ts');
if (fs.existsSync(loggerPath)) {
  console.log('✓ Logger source file exists');
  
  // Read and check key methods
  const loggerContent = fs.readFileSync(loggerPath, 'utf8');
  
  const requiredMethods = [
    'debug',
    'info', 
    'warn',
    'error',
    'logWebSocketMessage',
    'logConnection',
    'logError',
    'getLogFilePath',
    'getLogStats'
  ];
  
  let allMethodsPresent = true;
  requiredMethods.forEach(method => {
    if (loggerContent.includes(method)) {
      console.log(`✓ Method ${method} found`);
    } else {
      console.log(`✗ Method ${method} missing`);
      allMethodsPresent = false;
    }
  });
  
  if (allMethodsPresent) {
    console.log('✓ All required logger methods are present');
  }
  
  // Check for file logging functionality
  if (loggerContent.includes('fs.appendFileSync') && loggerContent.includes('fs.mkdirSync')) {
    console.log('✓ File logging functionality present');
  } else {
    console.log('✗ File logging functionality missing');
  }
  
  // Check for console logging functionality
  if (loggerContent.includes('console.debug') && loggerContent.includes('console.info')) {
    console.log('✓ Console logging functionality present');
  } else {
    console.log('✗ Console logging functionality missing');
  }
  
  console.log('\nLogger source code verification completed!');
  
  // Show the log file path that will be used
  const logDir = path.join(process.cwd(), 'temp');
  const logFile = path.join(logDir, 'agent-server.log');
  console.log(`\nLog file will be created at: ${logFile}`);
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log('✓ Created temp directory for logs');
  }
  
} else {
  console.log('✗ Logger source file not found');
}