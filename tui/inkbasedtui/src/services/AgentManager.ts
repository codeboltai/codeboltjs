/**
 * Manages agent lifecycle
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AgentStatus {
  running: boolean;
  pid?: number;
  agentId?: string;
  uptime?: number;
  agentPath?: string;
  agentScript?: string;
}

export interface AgentEvents {
  'status-change': (status: AgentStatus) => void;
  'log': (message: string) => void;
  'agent-log': (message: string) => void;
  'error': (error: Error) => void;
}

export class AgentManager extends EventEmitter {
  private agentProcess?: ChildProcess;
  private status: AgentStatus;
  private startTime?: number;

  constructor() {
    super();
    this.status = {
      running: false,
    };
  }

  /**
   * Start the agent process
   */
  async start(serverHost = 'localhost', serverPort = 3001, agentPath?: string): Promise<void> {
    if (this.status.running) {
      throw new Error('Agent is already running');
    }

    // Determine agent path (in turbo monorepo)
    // __dirname is packages/tui/dist/services, so we need to go up to packages/sampleagent
    const defaultAgentPath = path.resolve(__dirname, '../../../sampleagent');
    const actualAgentPath = agentPath || defaultAgentPath;
    
    this.emit('log', `🤖 Resolved agent directory: ${path.resolve(actualAgentPath)}`);
    this.emit('log', `🔗 Agent will connect to ${serverHost}:${serverPort}`);

    try {
      // Check if agent directory exists and has required files
      const agentScript = path.join(actualAgentPath, 'dist', 'index.js');
      
      // Store agent path and script info (as absolute paths)
      this.status.agentPath = path.resolve(actualAgentPath);
      this.status.agentScript = path.resolve(agentScript);
      
      this.emit('log', `🚀 Attempting to start agent script: ${path.resolve(agentScript)}`);
      
      // Start agent process
      this.agentProcess = spawn('node', [agentScript, '--host', serverHost, '--port', serverPort.toString()], {
        cwd: actualAgentPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      // Handle agent process events
      this.agentProcess.stdout?.on('data', (data) => {
        const message = data.toString().trim();
        this.emit('log', `[AGENT] ${message}`);
        this.emit('agent-log', `[STDOUT] ${message}`);
        this.parseAgentLog(message);
      });

      this.agentProcess.stderr?.on('data', (data) => {
        const message = data.toString().trim();
        this.emit('log', `[AGENT ERROR] ${message}`);
        this.emit('agent-log', `[STDERR] ${message}`);
      });

      this.agentProcess.on('error', (error) => {
        this.emit('error', new Error(`Agent process error: ${error.message}`));
        this.updateStatus({ running: false, pid: undefined });
      });

      this.agentProcess.on('exit', (code, signal) => {
        this.emit('log', `Agent process exited with code ${code} and signal ${signal}`);
        this.updateStatus({ running: false, pid: undefined });
        this.cleanup();
      });

      // Wait a moment for agent to start
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.startTime = Date.now();
      this.updateStatus({
        running: true,
        pid: this.agentProcess.pid,
      });
      
      this.emit('log', 'Agent started successfully');
      
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Stop the agent process
   */
  async stop(): Promise<void> {
    if (!this.agentProcess || !this.status.running) {
      return;
    }

    this.emit('log', 'Stopping agent...');

    return new Promise((resolve) => {
      if (!this.agentProcess) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        this.emit('log', 'Force killing agent process');
        this.agentProcess?.kill('SIGKILL');
        resolve();
      }, 3000);

      this.agentProcess.once('exit', () => {
        clearTimeout(timeout);
        this.cleanup();
        resolve();
      });

      // Send graceful shutdown signal
      this.agentProcess.kill('SIGTERM');
    });
  }

  /**
   * Get current agent status
   */
  getStatus(): AgentStatus {
    if (this.status.running && this.startTime) {
      return {
        ...this.status,
        uptime: Date.now() - this.startTime,
      };
    }
    return this.status;
  }

  /**
   * Check if agent is running
   */
  isRunning(): boolean {
    return this.status.running;
  }

  private parseAgentLog(message: string): void {
    // Extract agent ID from log messages
    const agentIdMatch = message.match(/\[([^[\]]+)\]/);
    if (agentIdMatch && agentIdMatch[1].startsWith('agent-')) {
      this.updateStatus({
        ...this.status,
        agentId: agentIdMatch[1],
      });
    }
  }

  private updateStatus(newStatus: Partial<AgentStatus>): void {
    this.status = { ...this.status, ...newStatus };
    this.emit('status-change', this.status);
  }

  private cleanup(): void {
    this.agentProcess = undefined;
    this.startTime = undefined;
  }
}
