import { BaseMCPGetToolsNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess, getArrayInput } from './utils';

export class MCPGetToolsNode extends BaseMCPGetToolsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const tools = getArrayInput(this, 1, 'tools');
    if (!tools.length) {
      emitMCPFailure(this, 'Tool descriptors are required to fetch tools');
      return;
    }

    try {
      const response = await codebolt.mcp.getTools(tools);
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to fetch MCP tools', error);
    }
  }
}
