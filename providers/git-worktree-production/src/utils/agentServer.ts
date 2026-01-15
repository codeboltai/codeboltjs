import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import * as net from 'net';
import WebSocket from 'ws';
import * as path from 'path';

import type { ProviderConfig } from '../interfaces/IProviderService';
import type { Logger } from './logger';

type StartAgentServerOptions = {
  logger: Logger;
  port?: number; // Add port option
};

type StopAgentServerOptions = {
  logger: Logger;
  processRef: ChildProcess | null;
};

type IsPortInUseOptions = {
  port: number;
  host?: string;
};

type ServerHealthOptions = {
  logger: Logger;
  serverUrl: string;
};

export async function startAgentServer(options: StartAgentServerOptions): Promise<ChildProcess> {
  const { logger, port = 3001 } = options; // Default to 3001 if not specified
  logger.log('Starting agent server...');

  // Resolve the path to the agent server executable
  const agentServerPath = path.resolve(__dirname, '../../../../remoteexecutor/updatedAgentServer/dist/server.mjs');

  return await new Promise<ChildProcess>((resolve, reject) => {
    const processRef = spawn('node', [agentServerPath, '--noui', '--port', port.toString()], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    let serverStarted = false;

    processRef.stdout?.on('data', (data: any) => {
      const output = data.toString();
      logger.log('Agent Server:', output);
      if (!serverStarted && output.includes('Server started successfully')) {
        serverStarted = true;
        resolve(processRef);
      }
    });

    processRef.stderr?.on('data', (data: any) => {
      logger.error('Agent Server Error:', data.toString());
    });

    processRef.on('error', (error: any) => {
      logger.error('Failed to start agent server:', error);
      reject(error);
    });

    processRef.on('exit', (code: any, signal: any) => {
      logger.log(`Agent server exited with code ${code}, signal ${signal}`);
      if (!serverStarted) {
        reject(new Error('Agent server process exited before startup confirmation'));
      }
    });
  });
}

export async function stopAgentServer(options: StopAgentServerOptions): Promise<boolean> {
  const { logger, processRef } = options;

  if (!processRef) {
    logger.log('No agent server process to stop');
    return true;
  }

  logger.log('Stopping agent server process...');

  return await new Promise<boolean>((resolve) => {
    let resolved = false;

    const cleanup = (success: boolean) => {
      if (!resolved) {
        resolved = true;
        logger.log('Agent server process stopped');
        resolve(success);
      }
    };

    const handleExit = (code: number | null, signal: any) => {
      logger.log(`Agent server exited with code ${code}, signal ${signal}`);
      cleanup(true);
    };

    processRef.on('exit', handleExit);
    processRef.on('error', (error: any) => {
      logger.error('Agent server process error during shutdown:', error);
      cleanup(false);
    });

    try {
      logger.log('Sending SIGTERM to agent server...');
      processRef.kill('SIGTERM');
    } catch (error) {
      logger.warn('Error sending SIGTERM:', error);
      cleanup(false);
      return;
    }

    setTimeout(() => {
      if (!processRef.killed) {
        logger.log('Graceful shutdown timeout, force killing agent server...');
        try {
          processRef.kill('SIGKILL');
        } catch (killError) {
          logger.error('Error force killing process:', killError);
        }
      }
    }, 5_000);
  });
}

export async function isPortInUse(options: IsPortInUseOptions): Promise<boolean> {
  const { port, host = 'localhost' } = options;

  return await new Promise((resolve) => {
    const server = net.createServer();

    server.listen(port, host, () => {
      server.once('close', () => {
        resolve(false);
      });
      server.close();
    });

    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

export async function testServerHealth(options: ServerHealthOptions): Promise<boolean> {
  const { logger, serverUrl } = options;

  // Extract host and port from WebSocket URL and use HTTP health endpoint
  // serverUrl format: ws://localhost:3001 -> http://localhost:3001/health
  const httpUrl = serverUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://') + '/health';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);

    const response = await fetch(httpUrl, { signal: controller.signal });
    clearTimeout(timeout);

    return response.ok;
  } catch (error) {
    // If fetch fails (ECONNREFUSED, timeout, etc.), server is not healthy
    logger.warn(`Health check failed for ${httpUrl}:`, error instanceof Error ? error.message : error);
    return false;
  }
}

export async function isAgentServerRunning(config: ProviderConfig, logger: Logger, serverUrl: string): Promise<boolean> {
  try {
    const portInUse = await isPortInUse({
      port: config.agentServerPort ?? 3001,
      host: config.agentServerHost ?? 'localhost',
    });

    if (!portInUse) {
      logger.log(`Port ${config.agentServerPort ?? 3001} is not in use`);
      return false;
    }

    logger.log(`Port ${config.agentServerPort ?? 3001} is in use, testing server health...`);

    const isHealthy = await testServerHealth({ logger, serverUrl });
    if (isHealthy) {
      logger.log('Agent server is running and healthy');
      return true;
    }

    logger.log('Port is in use but server is not responding correctly');
    return false;
  } catch (error) {
    logger.warn('Error checking if agent server is running:', error);
    return false;
  }
}