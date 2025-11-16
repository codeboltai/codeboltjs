import { BaseGetToolsRequestNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetToolsRequest Node - actual implementation
export class GetToolsRequestNode extends BaseGetToolsRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const tools = this.getInputData(1);

    // Validate required tools parameter
    if (!tools || !Array.isArray(tools)) {
      const errorMessage = 'Error: Tools array is required for get tools request';
      console.error('GetToolsRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the MCP notification function
      codebolt.notify.mcp.GetToolsRequestNotify(
        tools
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get tools request`;
      this.setOutputData(1, false);
      console.error('GetToolsRequestNode error:', error);
    }
  }
}
