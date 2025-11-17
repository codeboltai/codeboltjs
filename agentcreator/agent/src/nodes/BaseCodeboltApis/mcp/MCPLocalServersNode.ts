import { BaseMCPLocalServersNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess } from './utils.js';

export class MCPLocalServersNode extends BaseMCPLocalServersNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.mcp.getLocalMCPServers();
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to fetch local MCP servers', error);
    }
  }
}
