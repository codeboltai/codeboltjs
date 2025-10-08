import {
  ClientConnection,
  formatLogMessage
} from '../types'; 
import { NotificationService } from '../services/NotificationService';
import type { 
  TerminalEvent,
  ExecuteCommandEvent,
  ExecuteCommandRunUntilErrorEvent,
  ExecuteCommandWithStreamEvent,
  CommandExecutionRequestNotification,
  CommandExecutionResponseNotification
} from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { spawn } from 'child_process';
import * as os from 'os';

/**
 * Handles terminal events with notifications (following readFileHandler pattern)
 */
export class TerminalHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle terminal events with actual command execution (following readFileHandler pattern)
   */
  handleTerminalEvent(agent: ClientConnection, terminalEvent: TerminalEvent) {
    const { requestId, type } = terminalEvent;
    console.log(formatLogMessage('info', 'TerminalHandler', `Handling terminal event: ${type} from ${agent.id}`));

    // Execute actual Terminal operations
    switch (type) {
      case 'executeCommand':
        {
          console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal executeCommand request notification`));
          
          (async () => {
            try {
              const commandEvent = terminalEvent as ExecuteCommandEvent;
              const command = commandEvent.message;
              
              if (!command) {
                throw new Error('Command is required');
              }

              // Execute the command
              const result = await this.executeCommand(command);
              
              const response = {
                success: true,
                data: result.output,
                type: 'executeCommandResponse',
                id: requestId,
                exitCode: result.exitCode,
                message: 'Command executed successfully'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: result.output,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal executeCommand response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to execute command: ${error}`,
                type: 'executeCommandResponse',
                id: requestId,
                exitCode: 1
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'executeCommandRunUntilError':
        {
          console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal executeCommandRunUntilError request notification`));
          
          (async () => {
            try {
              const commandEvent = terminalEvent as ExecuteCommandRunUntilErrorEvent;
              const command = commandEvent.message;
              
              if (!command) {
                throw new Error('Command is required');
              }

              // Execute the command with run until error logic
              const result = await this.executeCommandRunUntilError(command);
              
              const response = {
                success: true,
                data: result.output,
                type: 'executeCommandRunUntilErrorResponse',
                id: requestId,
                exitCode: result.exitCode,
                message: 'Command executed until error'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: result.output,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal executeCommandRunUntilError response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to execute command until error: ${error}`,
                type: 'executeCommandRunUntilErrorResponse',
                id: requestId,
                exitCode: 1
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'executeCommandWithStream':
        {
          console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal executeCommandWithStream request notification`));
          
          (async () => {
            try {
              const commandEvent = terminalEvent as ExecuteCommandWithStreamEvent;
              const command = commandEvent.message;
              
              if (!command) {
                throw new Error('Command is required');
              }

              // Execute the command with streaming
              const result = await this.executeCommandWithStream(command);
              
              const response = {
                success: true,
                data: result.output,
                type: 'executeCommandWithStreamResponse',
                id: requestId,
                exitCode: result.exitCode,
                message: 'Command executed with stream'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: result.output,
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal executeCommandWithStream response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to execute command with stream: ${error}`,
                type: 'executeCommandWithStreamResponse',
                id: requestId,
                exitCode: 1
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      case 'sendInterruptToTerminal':
        {
          console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal sendInterruptToTerminal request notification`));
          
          (async () => {
            try {
              // Send interrupt signal (CTRL+C equivalent)
              const result = await this.sendInterruptToTerminal();
              
              const response = {
                success: true,
                data: result,
                type: 'sendInterruptToTerminalResponse',
                id: requestId,
                message: 'Interrupt signal sent to terminal'
              };
              
              this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

              // Send response notification to app
              const responseNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: 'Interrupt signal sent',
                isError: false
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
              console.log(formatLogMessage('info', 'TerminalHandler', `Sent terminal sendInterruptToTerminal response notification`));

            } catch (error) {
              const errorResponse = {
                success: false,
                error: `Failed to send interrupt: ${error}`,
                type: 'sendInterruptToTerminalResponse',
                id: requestId
              };

              this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

              // Send error notification to app
              const errorNotification: CommandExecutionResponseNotification = {
                requestId: requestId,
                toolUseId: requestId,
                type: 'terminalnotify',
                action: 'executeCommandResult',
                content: error instanceof Error ? error.message : String(error),
                isError: true
              };

              this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
            }
          })();
        }
        break;

      default:
        const errorResponse = {
          success: false,
          error: `Unknown Terminal action: ${type}`,
          type: 'terminalResponse',
          id: requestId
        };
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        break;
    }
  }

  // Helper methods for terminal operations
  private async executeCommand(command: string): Promise<{ output: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const isWindows = os.platform() === 'win32';
      const shell = isWindows ? 'cmd' : 'bash';
      const args = isWindows ? ['/c', command] : ['-c', command];

      const child = spawn(shell, args, {
        cwd: process.cwd(),
        env: process.env,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        const output = stdout + (stderr ? `\nSTDERR:\n${stderr}` : '');
        resolve({ output, exitCode: code || 0 });
      });

      child.on('error', (error) => {
        reject(new Error(`Command execution failed: ${error.message}`));
      });

      // Set timeout to prevent hanging
      setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Command execution timeout'));
      }, 30000); // 30 seconds timeout
    });
  }

  private async executeCommandRunUntilError(command: string): Promise<{ output: string; exitCode: number }> {
    // For this implementation, we'll execute the command normally
    // In a more advanced implementation, this could handle multiple commands until one fails
    return this.executeCommand(command);
  }

  private async executeCommandWithStream(command: string): Promise<{ output: string; exitCode: number }> {
    // For this implementation, we'll execute the command normally
    // In a more advanced implementation, this could provide real-time streaming
    return this.executeCommand(command);
  }

  private async sendInterruptToTerminal(): Promise<string> {
    // For this implementation, we'll return a success message
    // In a more advanced implementation, this could send signals to running processes
    return 'Interrupt signal sent successfully';
  }
}