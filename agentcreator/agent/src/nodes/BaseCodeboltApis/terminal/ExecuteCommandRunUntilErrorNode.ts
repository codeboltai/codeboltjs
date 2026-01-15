import { BaseExecuteCommandRunUntilErrorNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ExecuteCommandRunUntilError Node - actual implementation
export class ExecuteCommandRunUntilErrorNode extends BaseExecuteCommandRunUntilErrorNode {
  constructor() {
    super();
  }

  async onExecute() {
    const command = this.getInputData(1);
    const executeInMain = this.getInputData(2) || false;

    if (!command || typeof command !== 'string' || !command.trim()) {
      const errorMessage = 'Error: Command cannot be empty';
      console.error('ExecuteCommandRunUntilErrorNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, errorMessage);
      return;
    }

    try {
      const errorResult = await codebolt.terminal.executeCommandRunUntilError(command, executeInMain as boolean);

      // Update outputs with error results (this function resolves when error occurs)
      this.setOutputData(1, errorResult);
      this.setOutputData(2, false); // Success is false when error occurs

      // Trigger the commandError event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error in command execution: ${error}`;
      this.setOutputData(1, errorMessage);
      this.setOutputData(2, false);
      console.error('ExecuteCommandRunUntilErrorNode error:', error);

      // Still trigger the event even if there's an error
      this.triggerSlot(0, null, null);
    }
  }
}