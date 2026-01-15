import { BaseExecuteCommandNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ExecuteCommand Node - actual implementation
export class ExecuteCommandNode extends BaseExecuteCommandNode {
  constructor() {
    super();
  }

  async onExecute() {
    const command = this.getInputData(1);
    const returnEmptyStringOnSuccess = this.getInputData(2) || false;

    if (!command || typeof command !== 'string' || !command.trim()) {
      const errorMessage = 'Error: Command cannot be empty';
      console.error('ExecuteCommandNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, errorMessage);
      return;
    }

    try {
      const result = await codebolt.terminal.executeCommand(command, returnEmptyStringOnSuccess as boolean);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the commandComplete event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error executing command: ${error}`;
      this.setOutputData(1, errorMessage);
      this.setOutputData(2, false);
      console.error('ExecuteCommandNode error:', error);
    }
  }
}