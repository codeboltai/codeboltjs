#!/usr/bin/env node
import { DockerProviderConfig } from '@codebolt/shared-types';
import { getDockerManagerConfig } from './config';
import { DockerManager } from './core/dockerManager';
import { CodeboltWebSocketClient } from './core/codeboltWebsocketClient';
import { DockerServerWebSocketClient } from './core/dockerServerWebSocketClient';

/**
 * Main entry point for Docker Provider Agent
 */
async function main() {
  console.log('🚀 Starting Docker Provider...');
  
  // Validate required environment variables
  const agentId = process.env.agentId;
  if (!agentId) {
    console.error('❌ ERROR: agentId environment variable is required');
    process.exit(1);
  }

  // Build configuration
  const config: DockerProviderConfig = {
    serverUrl: process.env.CODEBOLT_SERVER_URL || 'localhost',
    socketPort: process.env.SOCKET_PORT || '12345',
    maxReconnectAttempts: parseInt(process.env.MAX_RECONNECT_ATTEMPTS || '10'),
    reconnectDelay: parseInt(process.env.RECONNECT_DELAY || '2000'),
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '10000'),
    agentId: agentId,
    agentTask: process.env.agentTask,
    isDev: process.env.Is_Dev === 'true',
    providerId: process.env.providerId ||'',
    storedTaskId: process.env.storedTaskId || '',
  };

  // Initialize components
  const dockerManager = new DockerManager(getDockerManagerConfig());
  const codeboltClient = new CodeboltWebSocketClient(config);
  const dockerServerClient = new DockerServerWebSocketClient();

  // Set up message routing
  codeboltClient.setDockerServerCallback((message) => {
    dockerServerClient.sendToDockerServer(message);
  });
  
  dockerServerClient.setMessageCallback((message) => {
    codeboltClient.sendFromDockerServer(message);
  });

  // Handle graceful shutdown
  const shutdown = async () => {
    console.log('🛑 Shutting down...');
    try {
      dockerServerClient.close();
      codeboltClient.close();
      await dockerManager.stopAndRemoveContainer();
      await dockerManager.cleanup();
      console.log('✅ Shutdown complete');
      process.exit(0);
    } catch (error) {
      console.error('❌ Shutdown error:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  process.on('SIGQUIT', shutdown);
  
  try {
    console.log(`📋 Agent: ${config.agentId} → ${config.serverUrl}:${config.socketPort}`);

    // Start Docker container and connect to Codebolt in parallel
    console.log('⚙️  Starting Docker container and connecting to Codebolt...');
    const [containerInfo] = await Promise.all([
      dockerManager.createAndStartContainer(),
      codeboltClient.initializeWebSocket()
    ]);

    console.log(`✅ Container: ${containerInfo.name}`);
    console.log('✅ Connected to Codebolt');

    // Wait for Docker server to be ready
    console.log('⏳ Waiting for Docker server...');
    let retries = 30;
    while (retries > 0) {
      const isHealthy = await dockerManager.isContainerHealthy();
      if (isHealthy) break;
      await new Promise(resolve => setTimeout(resolve, 2000));
      retries--;
    }
    
    if (retries === 0) {
      throw new Error('Docker server failed to become ready');
    }

    // Connect to Docker server
    console.log('🔗 Connecting to Docker server...');
    await dockerServerClient.connectToDockerServer(containerInfo);
    console.log('✅ Connected to Docker server');

    // Notify Codebolt that system is ready
    codeboltClient.sendFromDockerServer({
      type: 'system-ready',
      timestamp: new Date().toISOString(),
      containerInfo: containerInfo,
      agentId: config.agentId,
      providerId: config.providerId,
      storedTaskId: config.storedTaskId,
      agentTask: config.agentTask,
      isDev: config.isDev,
      serverUrl: config.serverUrl,
      socketPort: config.socketPort,
      IS_REMOTE_PROVIDER: true
    });

    console.log('🎉 Docker Provider is ready!');
    
  } catch (error) {
    console.error('❌ Failed to start:', error);
    process.exit(1);
  }
}

// Run main function if this file is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Unhandled error in main:', error);
    process.exit(1);
  });
}
