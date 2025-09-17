/**
 * Main Codebolt CLI Application
 */

import React from 'react';
import { render } from 'ink';
import { App } from './ui/App.js';
import { ServerManager } from './services/ServerManager.js';
import { parseArguments } from './config/config.js';

// Global logger function that will be set by App component
let globalLogFn: ((message: string) => void) | null = null;
export function setGlobalLogger(logFn: (message: string) => void) {
  globalLogFn = logFn;
}

function logToTUI(message: string) {
  if (globalLogFn) {
    globalLogFn(message);
  } else {
    // Fallback to file logging if TUI not ready
    const fs = require('fs');
    fs.appendFileSync('/tmp/codebolt-tui.log', `${new Date().toISOString()} ${message}\n`);
  }
}

export async function main() {
  try {
    // Check if raw mode is supported before starting TUI
    if (!process.stdin.isTTY) {
      console.error('Error: TUI requires a proper terminal (TTY) to run.');
      console.error('Try running directly in your terminal instead of through npm scripts.');
      console.error('Alternative: Use a proper terminal or run with: node packages/tui/dist/index.mjs');
      process.exit(1);
    }
    
    // Set up stream error handling to prevent crashes
    process.stdout.on('error', (err) => {
      // Ignore EPIPE and other stdout errors that can happen when output is redirected
      if (err.code !== 'EPIPE') {
        console.error('stdout error:', err.message);
      }
    });
    
    process.stderr.on('error', (err) => {
      // Ignore EPIPE and other stderr errors
      if (err.code !== 'EPIPE') {
        console.error('stderr error:', err.message);
      }
    });
    
    // Parse command line arguments
    const args = parseArguments();
    
    // Initialize server manager
    const serverManager = new ServerManager();
    
    // Setup graceful shutdown
    const cleanup = async () => {
      console.log('\nShutting down Codebolt CLI...');
      try {
        await serverManager.stop();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', async (error) => {
      logToTUI(`❌ Uncaught Exception: ${error.message}`);
      logToTUI(`Stack: ${error.stack}`);
      
      // Don't exit for stream-related errors that can be recovered from
      if (error.message.includes('_write() method is not implemented') || 
          error.message.includes('ERR_METHOD_NOT_IMPLEMENTED') ||
          error.code === 'ERR_METHOD_NOT_IMPLEMENTED') {
        logToTUI(`⚠️ Recovered from stream error - continuing TUI operation`);
        return; // Don't exit, continue running
      }
      
      logToTUI(`💀 Fatal error - TUI will exit`);
      await serverManager.stop();
      process.exit(1);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      logToTUI(`❌ Unhandled Rejection - TUI will exit: ${reason}`);
      await serverManager.stop();
      process.exit(1);
    });

    // Add exit diagnostics
    process.on('exit', (code) => {
      logToTUI(`🚪 TUI process exiting with code: ${code}`);
    });

    process.on('beforeExit', (code) => {
      logToTUI(`⚠️ TUI before exit with code: ${code}`);
    });

    // Add additional error handling for common stream issues
    process.on('warning', (warning) => {
      logToTUI(`⚠️ Process Warning: ${warning.message}`);
    });
    
    // Render the React app with error boundary
    const { unmount } = render(<App serverManager={serverManager} args={args} />);
    
    // Store unmount function for cleanup
    process.on('exit', () => {
      unmount();
    });

  } catch (error) {
    console.error('Failed to start Codebolt CLI:', error);
    process.exit(1);
  }
}
