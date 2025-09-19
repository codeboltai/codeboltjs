#!/usr/bin/env node

/**
 * Sample Agent Entry Point
 */

import './agent.js';
import { main } from './agent.js';

// Global Entry Point
main().catch((error) => {
  console.error('An unexpected critical error occurred in agent:');
  if (error instanceof Error) {
    console.error(error.stack);
  } else {
    console.error(String(error));
  }
  process.exit(1);
});
