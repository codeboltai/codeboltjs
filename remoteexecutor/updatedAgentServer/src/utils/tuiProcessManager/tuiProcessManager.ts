import { ChildProcess, spawn } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

import type { AgentExecutorServer } from '../../core/mainAgentExecutorServer';
import type { AgentCliOptions, ServerConfig } from '../../types';
import { logger } from '../logger';
import { AgentService } from '../../services/AgentService';

const DEFAULT_AGENT_ID = 'cli-agent';
const DEFAULT_AGENT_NAME = 'Ask Agent';
const DEFAULT_AGENT_TYPE = 'local-path';
const DEFAULT_AGENT_DETAILS = './../../agents/CliTestAgent/dist';

interface TuiProcessManagerDependencies {
  server: AgentExecutorServer;
  config: ServerConfig;
  options: AgentCliOptions;
}

interface ShutdownOptions {
  exitCode?: number;
  reason?: string;
}

export class TuiProcessManager {
  private tuiProcess: ChildProcess | null = null;
  private isShuttingDown = false;

  private readonly server: AgentExecutorServer;
  private readonly config: ServerConfig;
  private readonly options: AgentCliOptions;

  constructor({ server, config, options }: TuiProcessManagerDependencies) {
    this.server = server;
    this.config = config;
    this.options = options;
  }

  public initialize(): void {
    if (this.options.noui) {
      return;
    }

    const gotuiPath = resolve(process.cwd(), '../../tui/gotui/gotui');

    if (!existsSync(gotuiPath)) {
      logger.error(`TUI executable not found at: ${gotuiPath}`);
      return;
    }

    logger.info(`Starting TUI from: ${gotuiPath}`);

    if (process.stdout.isTTY) {
      process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
    }

    const host = this.config.host || 'localhost';
    const port = this.config.port || 3001;
    const protocol = this.options.remote ? 'wss' : 'ws';

    const selectedAgentEnv = this.getSelectedAgentEnv();

    this.tuiProcess = spawn(
      gotuiPath,
      ['-host', host, '-port', port.toString()],
      {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: {
          ...process.env,
          AGENT_SERVER_HOST: host,
          AGENT_SERVER_PORT: port.toString(),
          AGENT_SERVER_PROTOCOL: protocol,
          ...selectedAgentEnv
        }
      }
    );

    this.tuiProcess.on('error', (error) => {
      logger.error(`Failed to start TUI: ${error.message}`, error);
    });

    this.tuiProcess.on('exit', (code, signal) => {
      if (signal === 'SIGINT' || signal === 'SIGTERM') {
        logger.info('TUI terminated by signal, shutting down server...');
        void this.shutdown();
      } else if (code !== 0) {
        logger.error(`TUI exited with code: ${code}`);
      } else {
        logger.info('TUI exited successfully');
      }
    });
  }

  private getSelectedAgentEnv(): Record<string, string> {
    const cliAgent = AgentService.getInstance().getCliAgentInfo();

    const agentId = cliAgent?.agentId || DEFAULT_AGENT_ID;
    const agentName = cliAgent?.agentName || DEFAULT_AGENT_NAME;
    const agentType = this.options.agentType ?? cliAgent?.agentType ?? DEFAULT_AGENT_TYPE;
    const agentDetail = this.options.agentDetail ?? cliAgent?.agentDetails ?? DEFAULT_AGENT_DETAILS;

    if (!agentDetail) {
      logger.warn('Agent detail missing; falling back to default detail path.');
    }

    return {
      SELECTED_AGENT_ID: agentId,
      SELECTED_AGENT_NAME: agentName,
      SELECTED_AGENT_TYPE: agentType,
      SELECTED_AGENT_DETAIL: agentDetail
    };
  }

  public registerSignalHandlers(): void {
    process.on('SIGINT', this.handleShutdownSignal);
    process.on('SIGTERM', this.handleShutdownSignal);
  }

  public async shutdown(options: ShutdownOptions = {}): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }
    this.isShuttingDown = true;

    const message = options.reason || 'Received shutdown signal, shutting down gracefully...';
    logger.info(message);

    await this.stopTuiProcess();

    await this.server.stop();
    process.exit(options.exitCode ?? 0);
  }

  public async stopTuiProcess(): Promise<void> {
    if (this.tuiProcess && !this.tuiProcess.killed) {
      logger.info('Stopping TUI process...');
      this.tuiProcess.kill('SIGTERM');
      this.tuiProcess = null;
    }
  }

  private handleShutdownSignal = (): void => {
    void this.shutdown();
  };
}

export function createTuiProcessManager(dependencies: TuiProcessManagerDependencies): TuiProcessManager {
  const manager = new TuiProcessManager(dependencies);
  manager.registerSignalHandlers();
  return manager;
}
