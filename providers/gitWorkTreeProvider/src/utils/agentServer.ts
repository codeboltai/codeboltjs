import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import * as net from 'net';
import WebSocket from 'ws';

import type { ProviderConfig } from '../interfaces/IProviderService';
import type { Logger } from './logger';

type StartAgentServerOptions = {
  logger: Logger;
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
  const { logger } = options;
  logger.log('Starting agent server...');

  return await new Promise<ChildProcess>((resolve, reject) => {
    // Using relative path from project root
    const serverPath = '../../../remoteexecutor/updatedAgentServer/dist/server.js';
    const processRef = spawn('node', [serverPath, '--noui'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    let serverStarted = false;

    processRef.stdout?.on('data', (data) => {
      const output = data.toString();
      logger.log('Agent Server:', output);
      if (!serverStarted) {
        serverStarted = true;
        resolve(processRef);
      }
    });

    processRef.stderr?.on('data', (data) => {
      logger.error('Agent Server Error:', data.toString());
    });

    processRef.on('error', (error) => {
      logger.error('Failed to start agent server:', error);
      reject(error);
    });

    processRef.on('exit', (code, signal) => {
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

    const handleExit = (code: number | null, signal: NodeJS.Signals | null) => {
      logger.log(`Agent server exited with code ${code}, signal ${signal}`);
      cleanup(true);
    };

    processRef.on('exit', handleExit);
    processRef.on('error', (error) => {
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
  const { serverUrl } = options;

  return await new Promise((resolve) => {
    const testSocket = new WebSocket(serverUrl);

    const timeout = setTimeout(() => {
      testSocket.close();
      resolve(false);
    }, 3_000);

    testSocket.on('open', () => {
      clearTimeout(timeout);
      testSocket.close();
      resolve(true);
    });

    testSocket.on('error', () => {
      clearTimeout(timeout);
      resolve(false);
    });
  });
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

