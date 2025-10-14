#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Get the port from environment variables or default to 3001
const port = process.env.AGENT_SERVER_PORT || 3001;

// Spawn the provider process with the port argument
const providerProcess = spawn(
  'node',
  [path.join(__dirname, 'dist/index.js')],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      AGENT_SERVER_PORT: port
    }
  }
);

providerProcess.on('error', (error) => {
  console.error('Failed to start provider:', error);
  process.exit(1);
});

providerProcess.on('exit', (code) => {
  console.log(`Provider process exited with code ${code}`);
  process.exit(code || 0);
});