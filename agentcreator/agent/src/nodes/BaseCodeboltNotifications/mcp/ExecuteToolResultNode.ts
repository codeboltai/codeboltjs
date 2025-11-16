import { BaseExecuteToolResultNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ExecuteToolResult Node - actual implementation
export class ExecuteToolResultNode extends BaseExecuteToolResultNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const toolUseId = this.getInputData(2);
    const isError = (this.getInputData(3) as boolean) || false;

    // Validate required inputs
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for execute tool result';
      console.error('ExecuteToolResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!toolUseId || typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId is required for execute tool result';
      console.error('ExecuteToolResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the MCP notification function
      codebolt.notify.mcp.ExecuteToolResultNotify(
        content,
        isError,
        toolUseId
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send execute tool result`;
      this.setOutputData(1, false);
      console.error('ExecuteToolResultNode error:', error);
    }
  }
}
