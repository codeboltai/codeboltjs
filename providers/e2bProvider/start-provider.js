#!/usr/bin/env node

/**
 * Wrapper script to start the e2bProvider with NODE_OPTIONS filtering
 * This script filters out unsupported NODE_OPTIONS before spawning the actual provider
 */

const { spawn } = require('child_process');
const path = require('path');

// Filter NODE_OPTIONS to only include supported options for packaged apps
function filterNodeOptions(nodeOptions) {
  if (!nodeOptions) return undefined;
  
  const supportedOptions = ['--max-http-header-size', '--http-parser'];
  const currentOptions = nodeOptions.split(' ').filter(option => 
    option.trim() && supportedOptions.some(supported => option.includes(supported))
  );
  
  return currentOptions.length > 0 ? currentOptions.join(' ') : undefined;
}

// Create clean environment
const cleanEnv = { ...process.env };

if (cleanEnv.NODE_OPTIONS) {
  const filteredOptions = filterNodeOptions(cleanEnv.NODE_OPTIONS);
  if (filteredOptions) {
    cleanEnv.NODE_OPTIONS = filteredOptions;
    console.log('[E2B Provider Wrapper] Filtered NODE_OPTIONS to:', filteredOptions);
  } else {
    delete cleanEnv.NODE_OPTIONS;
    console.log('[E2B Provider Wrapper] Removed unsupported NODE_OPTIONS for packaged app compatibility');
  }
}

// Get the actual provider script path
const providerScript = path.join(__dirname, 'dist', 'index.js');

// Spawn the provider with clean environment
const provider = spawn('node', [providerScript], {
  env: cleanEnv,
  stdio: 'inherit',
  cwd: __dirname
});

// Handle process termination
provider.on('exit', (code, signal) => {
  console.log(`[E2B Provider Wrapper] Provider exited with code ${code} and signal ${signal}`);
  process.exit(code);
});

provider.on('error', (err) => {
  console.error('[E2B Provider Wrapper] Failed to start provider:', err);
  process.exit(1);
});

// Forward signals to the child process
process.on('SIGTERM', () => provider.kill('SIGTERM'));
process.on('SIGINT', () => provider.kill('SIGINT'));
process.on('SIGQUIT', () => provider.kill('SIGQUIT'));
