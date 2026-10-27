#!/usr/bin/env node

const { spawn } = require('node:child_process');
const path = require('node:path');

const providerProcess = spawn('node', [path.join(__dirname, 'dist/index.js')], {
  stdio: 'inherit',
  env: process.env,
});

providerProcess.on('error', (error) => {
  console.error('Failed to start AgentFS provider:', error);
  process.exit(1);
});

providerProcess.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code || 0);
});
