import { BaseExecuteToolRequestNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ExecuteToolRequest Node - actual implementation
export class ExecuteToolRequestNode extends BaseExecuteToolRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const toolbox = this.getInputData(1);
    const toolName = this.getInputData(2);
    const params = this.getInputData(3);

    // Validate required inputs
    if (!toolbox || typeof toolbox !== 'string') {
      const errorMessage = 'Error: Toolbox is required for execute tool request';
      console.error('ExecuteToolRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!toolName || typeof toolName !== 'string') {
      const errorMessage = 'Error: Tool name is required for execute tool request';
      console.error('ExecuteToolRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (params === undefined) {
      const errorMessage = 'Error: Params is required for execute tool request';
      console.error('ExecuteToolRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the MCP notification function
      codebolt.notify.mcp.ExecuteToolRequestNotify(
        toolbox,
        toolName,
        params
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send execute tool request`;
      this.setOutputData(1, false);
      console.error('ExecuteToolRequestNode error:', error);
    }
  }
}
