import { BaseGetEnabledMCPServersResultNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetEnabledMCPServersResult Node - actual implementation
export class GetEnabledMCPServersResultNode extends BaseGetEnabledMCPServersResultNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const toolUseId = this.getInputData(2);
    const isError = this.getInputData(3) || false;

    // Validate required inputs
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for get enabled MCP servers result';
      console.error('GetEnabledMCPServersResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!toolUseId || typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId is required for get enabled MCP servers result';
      console.error('GetEnabledMCPServersResultNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the MCP notification function
      codebolt.notify.mcp.GetEnabledMCPServersResultNotify(
        content,
        isError,
        toolUseId
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get enabled MCP servers result`;
      this.setOutputData(1, false);
      console.error('GetEnabledMCPServersResultNode error:', error);
    }
  }
}
