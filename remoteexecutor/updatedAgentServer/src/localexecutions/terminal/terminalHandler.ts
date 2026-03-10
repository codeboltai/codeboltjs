import type { ClientConnection } from "../../types";
import { ConnectionManager } from "../../main/core/connectionManagers/connectionManager.js";
import { TerminalService, createTerminalService } from "../../main/server/services/TerminalService";
import { logger } from "../../main/utils/logger";
import { formatLogMessage } from "../../types/utils";
import { NotificationService, ClientResolver } from "../../shared";

export class TerminalHandler {
  private connectionManager = ConnectionManager.getInstance();
  private terminalService: TerminalService;
  private notificationService = NotificationService.getInstance();
  private clientResolver = new ClientResolver();

  // Track running processes for interrupt support
  private runningProcesses = new Map<string, { abort: () => void }>();

  constructor() {
    this.terminalService = createTerminalService({
      targetDir: process.cwd(),
    });
  }

  async handleTerminalEvent(agent: ClientConnection, message: any): Promise<void> {
    const type = message.type as string;

    switch (type) {
      case 'executeCommand':
        await this.handleExecuteCommand(agent, message);
        break;
      case 'executeCommandRunUntilError':
        await this.handleExecuteCommand(agent, message);
        break;
      case 'executeCommandRunUntilInterrupt':
        await this.handleExecuteCommand(agent, message);
        break;
      case 'executeCommandWithStream':
        await this.handleExecuteCommandWithStream(agent, message);
        break;
      case 'sendInterruptToTerminal':
        await this.handleSendInterrupt(agent, message);
        break;
      default:
        logger.warn(
          formatLogMessage("warn", "TerminalHandler", `Unknown terminal event type: ${type}`)
        );
        break;
    }
  }

  private async handleExecuteCommand(agent: ClientConnection, message: any): Promise<void> {
    const command = message.message as string;
    const requestId = message.requestId as string;
    const returnEmptyStringOnSuccess = message.returnEmptyStringOnSuccess ?? false;
    const targetClient = this.clientResolver.resolveParent(agent);

    // Send notification that command is executing
    this.notifyCommandExecution(agent, requestId, command, targetClient);

    try {
      const result = await this.terminalService.executeCommand(command);

      if (result.exitCode === 0 || result.error === null) {
        // Command finished successfully
        const output = returnEmptyStringOnSuccess ? '' : result.output;
        this.connectionManager.sendToConnection(agent.id, {
          type: 'commandFinish',
          requestId,
          exitCode: result.exitCode ?? 0,
          stdout: output,
          stderr: '',
          success: true,
          message: output || 'Command executed successfully',
        });
      } else {
        // Command errored
        this.connectionManager.sendToConnection(agent.id, {
          type: 'commandError',
          requestId,
          error: result.error?.message || result.output || 'Command failed',
          exitCode: result.exitCode ?? 1,
          stderr: result.output,
          success: false,
          message: result.error?.message || 'Command failed',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error(
        formatLogMessage("error", "TerminalHandler", `Execute command failed: ${errorMessage}`)
      );
      this.connectionManager.sendToConnection(agent.id, {
        type: 'commandError',
        requestId,
        error: errorMessage,
        exitCode: 1,
        stderr: errorMessage,
        success: false,
        message: errorMessage,
      });
    }
  }

  private async handleExecuteCommandWithStream(agent: ClientConnection, message: any): Promise<void> {
    const command = message.message as string;
    const requestId = message.requestId as string;
    const targetClient = this.clientResolver.resolveParent(agent);

    this.notifyCommandExecution(agent, requestId, command, targetClient);

    try {
      const result = await this.terminalService.executeCommand(command, {
        updateOutput: (output: string) => {
          // Stream output chunks to agent
          this.connectionManager.sendToConnection(agent.id, {
            type: 'commandOutput',
            requestId,
            output,
            success: true,
          });
        },
      });

      if (result.exitCode === 0 || result.error === null) {
        this.connectionManager.sendToConnection(agent.id, {
          type: 'commandFinish',
          requestId,
          exitCode: result.exitCode ?? 0,
          stdout: result.output,
          success: true,
          message: 'Command finished',
        });
      } else {
        this.connectionManager.sendToConnection(agent.id, {
          type: 'commandError',
          requestId,
          error: result.error?.message || 'Command failed',
          exitCode: result.exitCode ?? 1,
          stderr: result.output,
          success: false,
          message: result.error?.message || 'Command failed',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.connectionManager.sendToConnection(agent.id, {
        type: 'commandError',
        requestId,
        error: errorMessage,
        exitCode: 1,
        success: false,
        message: errorMessage,
      });
    }
  }

  private async handleSendInterrupt(agent: ClientConnection, message: any): Promise<void> {
    const requestId = message.requestId as string;

    // Send interrupt response
    this.connectionManager.sendToConnection(agent.id, {
      type: 'terminalInterrupted',
      requestId,
      success: true,
      message: 'Terminal interrupted',
    });
  }

  private notifyCommandExecution(
    agent: ClientConnection,
    requestId: string,
    command: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    // Log the execution
    logger.info(
      formatLogMessage("info", "TerminalHandler", `Executing command: ${command}`)
    );
  }
}
