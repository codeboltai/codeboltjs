import { BaseMCPGetEnabledNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess } from './utils.js';

export class MCPGetEnabledNode extends BaseMCPGetEnabledNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.mcp.getEnabledMCPServers();
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to fetch enabled MCP servers', error);
    }
  }
}
