/**
 * Manages the Codebolt server lifecycle
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ServerStatus {
  running: boolean;
  pid?: number;
  port: number;
  host: string;
  uptime?: number;
  serverPath?: string;
  serverScript?: string;
  connections?: {
    agents: number;
    clients: number;
  };
}

export interface ServerEvents {
  'status-change': (status: ServerStatus) => void;
  'log': (message: string) => void;
  'server-log': (message: string) => void;
  'error': (error: Error) => void;
  'agent-connected': (agentId: string) => void;
  'agent-disconnected': (agentId: string) => void;
  'client-connected': (clientId: string) => void;
  'client-disconnected': (clientId: string) => void;
}

export class ServerManager extends EventEmitter {
  private serverProcess?: ChildProcess;
  private status: ServerStatus;
  private startTime?: number;
  private healthCheckInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.status = {
      running: false,
      port: 3001,
      host: 'localhost',
    };
  }

  /**
   * Start the server process
   */
  async start(port = 3001, host = 'localhost', serverPath?: string): Promise<void> {
    if (this.status.running) {
      throw new Error('Server is already running');
    }

    // Determine the correct default server path based on environment
    // In development: packages/agentserver
    // In production: apps/codebolt-code/server
    const isDev = process.env.CODEBOLT_ENV === 'dev';
    let defaultServerPath: string;
    
    if (isDev) {
      // In dev mode, we're in packages/tui/dist/services, need to go to packages/agentserver
      defaultServerPath = path.resolve(__dirname, '../../../agentserver');
    } else {
      // In production mode, we're in apps/codebolt-code/tui, need to go to apps/codebolt-code/server
      defaultServerPath = path.resolve(__dirname, '../server');
    }
    
    const actualServerPath = serverPath ? path.resolve(serverPath) : defaultServerPath;
    
    // Log the absolute path immediately
    this.emit('log', `📁 Resolved server directory: ${path.resolve(actualServerPath)}`);
    this.emit('log', `🌐 Server will run on ${host}:${port}`);

    try {
      // Check if server directory exists and has required files
      const serverScript = isDev
        ? path.join(actualServerPath, 'dist', 'server.mjs')
        : path.join(actualServerPath, 'server.mjs');
      
      // Store server path and script info (as absolute paths)
      this.status.serverPath = path.resolve(actualServerPath);
      this.status.serverScript = path.resolve(serverScript);
      
      this.emit('log', `🚀 Attempting to start server script: ${path.resolve(serverScript)}`);
      this.emit('log', `⚙️ Environment mode: ${isDev ? 'development' : 'production'}`);
      this.emit('server-log', `[SPAWN] Starting server process: node ${serverScript}`);
      this.emit('server-log', `[SPAWN] Working directory: ${actualServerPath}`);
      this.emit('server-log', `[SPAWN] Environment: PORT=${port}, HOST=${host}, CODEBOLT_ENV=${process.env.CODEBOLT_ENV || 'production'}`);
      
      // Start server process
      this.serverProcess = spawn('node', [serverScript], {
        cwd: actualServerPath,
        env: {
          ...process.env,
          PORT: port.toString(),
          HOST: host,
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.emit('server-log', `[SPAWN] Server process spawned with PID: ${this.serverProcess.pid}`);
      this.emit('log', `✅ Server process spawned with PID: ${this.serverProcess.pid}`);

      // Handle server process events
      this.serverProcess.stdout?.on('data', (data) => {
        const messages = data.toString().split('\n').filter(msg => msg.trim());
        messages.forEach(message => {
          this.emit('log', `[SERVER] ${message}`);
          this.emit('server-log', `[STDOUT] ${message}`);
          this.parseServerLog(message);
        });
      });

      this.serverProcess.stderr?.on('data', (data) => {
        const messages = data.toString().split('\n').filter(msg => msg.trim());
        messages.forEach(message => {
          this.emit('log', `[SERVER ERROR] ${message}`);
          this.emit('server-log', `[STDERR] ${message}`);
        });
      });

      this.serverProcess.on('error', (error) => {
        this.emit('log', `❌ Server process spawn error: ${error.message}`);
        this.emit('server-log', `[ERROR] Failed to spawn server process: ${error.message}`);
        this.emit('error', new Error(`Server process error: ${error.message}`));
        this.updateStatus({ running: false, pid: undefined });
      });

      this.serverProcess.on('exit', (code, signal) => {
        this.emit('log', `Server process exited with code ${code} and signal ${signal}`);
        this.emit('server-log', `[EXIT] Server process exited with code ${code} and signal ${signal}`);
        this.updateStatus({ running: false, pid: undefined });
        this.cleanup();
      });

      // Don't wait for server to be ready in the startup flow - let it start async
      // await this.waitForServerReady(port, host);
      this.emit('log', '⏳ Server starting... will check readiness in background');
      
      this.startTime = Date.now();
      this.updateStatus({
        running: true,
        pid: this.serverProcess.pid,
        port,
        host,
      });

      // Start health monitoring with a delay to give server time to start
      setTimeout(() => {
        this.startHealthMonitoring();
      }, 5000);
      
      this.emit('log', 'Server process started successfully');
      
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Stop the server process
   */
  async stop(): Promise<void> {
    if (!this.serverProcess || !this.status.running) {
      this.emit('log', 'Server stop requested but no process running');
      return;
    }

    this.emit('log', 'Stopping server...');
    this.emit('server-log', '[STOP] Server stop requested');

    return new Promise((resolve) => {
      if (!this.serverProcess) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        this.emit('log', 'Force killing server process');
        this.serverProcess?.kill('SIGKILL');
        resolve();
      }, 5000);

      this.serverProcess.once('exit', () => {
        clearTimeout(timeout);
        this.cleanup();
        resolve();
      });

      // Send graceful shutdown signal
      this.serverProcess.kill('SIGTERM');
    });
  }

  /**
   * Get current server status
   */
  getStatus(): ServerStatus {
    if (this.status.running && this.startTime) {
      return {
        ...this.status,
        uptime: Date.now() - this.startTime,
      };
    }
    return this.status;
  }

  /**
   * Check if server is healthy
   */
  async isHealthy(): Promise<boolean> {
    if (!this.status.running) {
      return false;
    }

    try {
      const response = await fetch(`http://${this.status.host}:${this.status.port}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async waitForServerReady(port: number, host: string): Promise<void> {
    const maxAttempts = 30;
    const delay = 1000;

    for (let i = 0; i < maxAttempts; i++) {
      try {
        const response = await fetch(`http://${host}:${port}/health`);
        if (response.ok) {
          return;
        }
      } catch {
        // Server not ready yet
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }

    throw new Error('Server failed to start within timeout period');
  }

  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const response = await fetch(`http://${this.status.host}:${this.status.port}/connections`);
        if (response.ok) {
          const data = await response.json();
          this.updateStatus({
            ...this.status,
            connections: {
              agents: data.agents?.length || 0,
              clients: data.clients?.length || 0,
            },
          });
        }
      } catch {
        // Health check failed, but don't emit error for temporary network issues
      }
    }, 5000);
  }

  private parseServerLog(message: string): void {
    // Parse server logs for connection events
    if (message.includes('New WebSocket connection')) {
      // Extract connection info if available
    } else if (message.includes('Agent connected')) {
      // Extract agent ID and emit event
    } else if (message.includes('Client connected')) {
      // Extract client ID and emit event
    }
  }

  private updateStatus(newStatus: Partial<ServerStatus>): void {
    this.status = { ...this.status, ...newStatus };
    this.emit('status-change', this.status);
  }

  private cleanup(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = undefined;
    }
    this.serverProcess = undefined;
    this.startTime = undefined;
  }
}
