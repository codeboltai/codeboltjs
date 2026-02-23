import { spawn } from 'child_process';
import type { ChildProcess } from 'child_process';
import * as net from 'net';

import type { Logger } from './logger';

type StartAgentServerOptions = {
  logger: Logger;
  port?: number;
  projectPath?: string;
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
  const { logger, port = 3001, projectPath } = options;
  logger.log('Starting agent server...');

  // Resolve agent server entry point from the @codebolt/agentserver npm package
  const agentServerPath = require.resolve('@codebolt/agentserver');

  const args = [agentServerPath, '--noui', '--port', port.toString()];

  if (projectPath) {
    args.push('--project-path', projectPath);
  }

  return await new Promise<ChildProcess>((resolve, reject) => {
    const processRef = spawn('node', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    let serverStarted = false;

    processRef.stdout?.on('data', (data: Buffer) => {
      const output = data.toString();
      logger.log('Agent Server:', output);
      if (!serverStarted && output.includes('Server started successfully')) {
        serverStarted = true;
        resolve(processRef);
      }
    });

    processRef.stderr?.on('data', (data: Buffer) => {
      logger.error('Agent Server Error:', data.toString());
    });

    processRef.on('error', (error: Error) => {
      logger.error('Failed to start agent server:', error);
      reject(error);
    });

    processRef.on('exit', (code: number | null, signal: string | null) => {
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

    processRef.on('exit', () => {
      cleanup(true);
    });

    processRef.on('error', (error: Error) => {
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

    server.on('error', (err: NodeJS.ErrnoException) => {
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

  const httpUrl = serverUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://') + '/health';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);

    const response = await fetch(httpUrl, { signal: controller.signal });
    clearTimeout(timeout);

    return response.ok;
  } catch (error) {
    logger.warn(`Health check failed for ${httpUrl}:`, error instanceof Error ? error.message : error);
    return false;
  }
}
