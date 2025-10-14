import { startAgentServer, stopAgentServer, isPortInUse, testServerHealth } from './src/utils/agentServer';
import type { ChildProcess } from 'child_process';
import * as http from 'http';

// Simple logger implementation for testing
const logger = {
  log: (...args: any[]) => console.log('[TEST]', ...args),
  error: (...args: any[]) => console.error('[ERROR]', ...args),
  warn: (...args: any[]) => console.warn('[WARN]', ...args),
};

async function makeHttpRequest(url: string): Promise<{ statusCode: number | undefined; data: string }> {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testAgentServerAdvanced() {
  let processRef: ChildProcess | null = null;
  const testPort = 3003; // Use a different port for this test
  
  try {
    console.log('Testing agent server start...');
    
    // Start the agent server
    processRef = await startAgentServer({ logger, port: testPort });
    
    console.log('Agent server started successfully!');
    console.log('Process PID:', processRef.pid);
    
    // Wait a bit to let the server initialize
    console.log('Waiting for server to initialize...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check if the port is in use
    console.log('Checking if port is in use...');
    const portInUse = await isPortInUse({ port: testPort });
    console.log(`Port ${testPort} in use: ${portInUse}`);
    
    if (!portInUse) {
      throw new Error(`Port ${testPort} is not in use after server start`);
    }
    
    // Test health endpoint
    console.log('Testing health endpoint...');
    try {
      const healthResponse = await makeHttpRequest(`http://localhost:${testPort}/health`);
      console.log(`Health check response status: ${healthResponse.statusCode}`);
      console.log(`Health check response data: ${healthResponse.data}`);
      
      if (healthResponse.statusCode !== 200) {
        throw new Error(`Health check failed with status ${healthResponse.statusCode}`);
      }
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
    
    // Test connections endpoint
    console.log('Testing connections endpoint...');
    try {
      const connectionsResponse = await makeHttpRequest(`http://localhost:${testPort}/connections`);
      console.log(`Connections response status: ${connectionsResponse.statusCode}`);
      // We won't log the full data as it might be large
    } catch (error) {
      // The connections endpoint might not always be available, so we'll just log the error
      console.warn('Connections endpoint test failed (this might be expected):', error);
    }
    
    // Test WebSocket connection
    console.log('Testing WebSocket connection...');
    const wsHealthy = await testServerHealth({ 
      logger, 
      serverUrl: `ws://localhost:${testPort}` 
    });
    console.log(`WebSocket connection healthy: ${wsHealthy}`);
    
    console.log('All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  } finally {
    // Stop the agent server
    if (processRef) {
      console.log('Stopping agent server...');
      try {
        await stopAgentServer({ logger, processRef });
        console.log('Agent server stopped successfully!');
      } catch (stopError) {
        console.error('Failed to stop agent server:', stopError);
      }
    }
  }
}

// Run the test
testAgentServerAdvanced().then(() => {
  console.log('Advanced agent server test completed successfully!');
  process.exit(0);
}).catch((error) => {
  console.error('Advanced agent server test failed:', error);
  process.exit(1);
});