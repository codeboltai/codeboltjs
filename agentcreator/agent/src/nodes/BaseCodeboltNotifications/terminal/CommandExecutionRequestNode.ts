import { BaseCommandExecutionRequestNode } from '@agent-creator/shared-nodes';
import { CommandExecutionRequestNotify } from '@codebolt/codeboltjs';

// Backend CommandExecutionRequestNode - actual implementation
export class CommandExecutionRequestNode extends BaseCommandExecutionRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const command: any = this.getInputData(1);
    const returnEmptyStringOnSuccess: any = this.getInputData(2);
    const executeInMain: any = this.getInputData(3);

    // Validate required input
    if (!command || typeof command !== 'string' || !command.trim()) {
      const errorMessage = 'Error: Terminal command is required';
      console.error('CommandExecutionRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Prepare parameters, only pass boolean flags if they are explicitly set
      const params: any = {};

      if (typeof returnEmptyStringOnSuccess === 'boolean') {
        params.returnEmptyStringOnSuccess = returnEmptyStringOnSuccess;
      }

      if (typeof executeInMain === 'boolean') {
        params.executeInMain = executeInMain;
      }

      CommandExecutionRequestNotify(
        command,
        params.returnEmptyStringOnSuccess,
        params.executeInMain
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send terminal command request`;
      this.setOutputData(1, false);
      console.error('CommandExecutionRequestNode error:', error);
    }
  }
}