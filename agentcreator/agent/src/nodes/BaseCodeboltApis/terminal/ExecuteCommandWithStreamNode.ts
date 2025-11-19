import { BaseExecuteCommandWithStreamNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { TerminalResponseType } from '@codebolt/types/enum';

// Backend-specific ExecuteCommandWithStream Node - actual implementation
export class ExecuteCommandWithStreamNode extends BaseExecuteCommandWithStreamNode {
  private streamEmitter: any = null;
  private isStreaming = false;

  constructor() {
    super();
  }

  async onExecute() {
    const command = this.getInputData(1);
    const executeInMain = this.getInputData(2) || false;

    if (!command || typeof command !== 'string' || !command.trim()) {
      const errorMessage = 'Error: Command cannot be empty';
      console.error('ExecuteCommandWithStreamNode error:', errorMessage);
      this.setOutputData(7, null);
      this.setOutputData(6, errorMessage);
      this.setOutputData(5, false);
      return;
    }

    // Clean up any existing stream
    if (this.streamEmitter && this.streamEmitter.cleanup) {
      this.streamEmitter.cleanup();
      this.streamEmitter = null;
    }

    this.isStreaming = true;

    try {
      // Get the stream emitter
      this.streamEmitter = codebolt.terminal.executeCommandWithStream(command, executeInMain as boolean);

      // Set the stream emitter output
      this.setOutputData(7, this.streamEmitter);

      // Trigger stream started event
      this.triggerSlot(0, null, null);

      // Listen for streaming events
      this.streamEmitter.on(TerminalResponseType.COMMAND_OUTPUT, (data: any) => {
        if (this.isStreaming) {
          this.setOutputData(5, data.output || data);
          this.triggerSlot(1, null, null);
        }
      });

      this.streamEmitter.on(TerminalResponseType.COMMAND_ERROR, (data: any) => {
        if (this.isStreaming) {
          this.setOutputData(6, data.error || data);
          this.triggerSlot(3, null, null);
        }
      });

      this.streamEmitter.on(TerminalResponseType.COMMAND_FINISH, (data: any) => {
        if (this.isStreaming) {
          this.isStreaming = false;
          this.triggerSlot(2, null, null);

          // Clean up after finish
          if (this.streamEmitter && this.streamEmitter.cleanup) {
            this.streamEmitter.cleanup();
            this.streamEmitter = null;
          }
        }
      });

    } catch (error) {
      const errorMessage = `Error starting command stream: ${error}`;
      this.isStreaming = false;
      this.setOutputData(6, errorMessage);
      this.setOutputData(5, false);
      console.error('ExecuteCommandWithStreamNode error:', error);

      // Trigger error event
      this.triggerSlot(3, null, null);
    }
  }

  // Clean up when node is destroyed
  onRemoved(): void {
    this.isStreaming = false;
    if (this.streamEmitter && this.streamEmitter.cleanup) {
      this.streamEmitter.cleanup();
      this.streamEmitter = null;
    }
    super.onRemoved();
  }
}