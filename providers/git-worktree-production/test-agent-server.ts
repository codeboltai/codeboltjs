import { startAgentServer, stopAgentServer } from './src/utils/agentServer';
import type { ChildProcess } from 'child_process';

// Simple logger implementation for testing
const logger = {
  log: (...args: any[]) => console.log('[TEST]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
};

async function testAgentServer() {
  let processRef: ChildProcess | null = null;

  try {
    console.log('Testing agent server start...');

    // Start the agent server on a different port to avoid conflicts
    processRef = await startAgentServer({
      logger,
      port: 3002,
      projectPath: '/tmp'
    });

    console.log('Agent server started successfully!');
    console.log('Process PID:', processRef.pid);

    // Wait a bit to let the server initialize
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop the agent server
    console.log('Stopping agent server...');
    await stopAgentServer({ logger, processRef });

    console.log('Agent server stopped successfully!');
  } catch (error) {
    console.error('Test failed:', error);

    // Make sure to clean up if something went wrong
    if (processRef) {
      try {
        await stopAgentServer({ logger, processRef });
      } catch (stopError) {
        console.error('Failed to stop agent server:', stopError);
      }
    }

    process.exit(1);
  }
}

// Run the test
testAgentServer().catch(console.error);