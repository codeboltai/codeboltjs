import { BaseListToolsFromMCPServersRequestNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific ListToolsFromMCPServersRequest Node - actual implementation
export class ListToolsFromMCPServersRequestNode extends BaseListToolsFromMCPServersRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const toolboxes = this.getInputData(1);

    // Validate required toolboxes parameter
    if (!toolboxes || !Array.isArray(toolboxes)) {
      const errorMessage = 'Error: Toolboxes array is required for list tools request';
      console.error('ListToolsFromMCPServersRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the MCP notification function
      codebolt.notify.mcp.ListToolsFromMCPServersRequestNotify(
        toolboxes
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send list tools from MCP servers request`;
      this.setOutputData(1, false);
      console.error('ListToolsFromMCPServersRequestNode error:', error);
    }
  }
}
