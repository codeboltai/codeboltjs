import { BaseMCPListToolsNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess, getArrayInput } from './utils';

export class MCPListToolsNode extends BaseMCPListToolsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const toolBoxes = getArrayInput(this, 1, 'toolBoxes');
    if (!toolBoxes.length) {
      emitMCPFailure(this, 'At least one toolbox name is required');
      return;
    }

    try {
      const response = await codebolt.mcp.listMcpFromServers(toolBoxes);
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to list MCP tools', error);
    }
  }
}
