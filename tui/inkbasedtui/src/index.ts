#!/usr/bin/env node

/**
 * Codebolt CLI Entry Point
 */

import './codebolt.js';
import { main } from './codebolt.js';

// Global Entry Point
main().catch((error) => {
  console.error('An unexpected critical error occurred:');
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(String(error));
  }
  process.exit(1);
});
