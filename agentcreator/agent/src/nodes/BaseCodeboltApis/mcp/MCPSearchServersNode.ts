import { BaseMCPSearchServersNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess, getStringInput } from './utils.js';

export class MCPSearchServersNode extends BaseMCPSearchServersNode {
  constructor() {
    super();
  }

  async onExecute() {
    const query = getStringInput(this, 1, 'query');
    if (!query) {
      emitMCPFailure(this, 'Query is required to search MCP servers');
      return;
    }

    try {
      const response = await codebolt.mcp.searchAvailableMCPServers(query);
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to search MCP servers', error);
    }
  }
}
