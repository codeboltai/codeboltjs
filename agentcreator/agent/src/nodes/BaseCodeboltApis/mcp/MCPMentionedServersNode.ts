import { BaseMCPMentionedServersNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess, getObjectInput } from './utils.js';

export class MCPMentionedServersNode extends BaseMCPMentionedServersNode {
  constructor() {
    super();
  }

  async onExecute() {
    const userMessage = getObjectInput(this, 1, 'userMessage');
    if (!userMessage) {
      emitMCPFailure(this, 'User message is required to fetch mentioned MCP servers');
      return;
    }

    try {
      const response = await codebolt.mcp.getMentionedMCPServers(userMessage);
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to fetch mentioned MCP servers', error);
    }
  }
}
