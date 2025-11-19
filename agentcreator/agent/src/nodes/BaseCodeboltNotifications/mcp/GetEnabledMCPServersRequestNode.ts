import { BaseGetEnabledMCPServersRequestNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetEnabledMCPServersRequest Node - actual implementation
export class GetEnabledMCPServersRequestNode extends BaseGetEnabledMCPServersRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      // Call the MCP notification function
      codebolt.notify.mcp.GetEnabledMCPServersRequestNotify();

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get enabled MCP servers request`;
      this.setOutputData(1, false);
      console.error('GetEnabledMCPServersRequestNode error:', error);
    }
  }
}
