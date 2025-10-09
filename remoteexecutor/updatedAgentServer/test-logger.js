#!/usr/bin/env node

// Simple test for the logger with /tmp path
import fs from 'fs';
import path from 'path';

// Test basic file writing to /tmp
const logPath = '/tmp/agent-server.log';

try {
  // Ensure /tmp is accessible
  const timestamp = new Date().toISOString();
  const testMessage = `[${timestamp}] INFO: Testing logger with /tmp path`;
  
  // Write test message
  fs.appendFileSync(logPath, testMessage + '\n');
  
  // Verify it was written
  if (fs.existsSync(logPath)) {
    const content = fs.readFileSync(logPath, 'utf8');
    console.log('✅ Successfully wrote to /tmp/agent-server.log');
    console.log('Log file path:', logPath);
    console.log('File size:', fs.statSync(logPath).size, 'bytes');
    console.log('Last 5 lines:');
    const lines = content.trim().split('\n').slice(-5);
    lines.forEach(line => console.log('  ', line));
  } else {
    console.log('❌ Failed to create log file');
  }
} catch (error) {
  console.error('❌ Error testing /tmp log file:', error.message);
}