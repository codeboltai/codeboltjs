import { BaseMCPConfigureNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess, getObjectInput, getStringInput } from './utils.js';

export class MCPConfigureNode extends BaseMCPConfigureNode {
  constructor() {
    super();
  }

  async onExecute() {
    const name = getStringInput(this, 1, 'name');
    if (!name) {
      emitMCPFailure(this, 'Toolbox name is required to configure MCP');
      return;
    }

    const config = getObjectInput(this, 2, 'config');
    if (!config) {
      emitMCPFailure(this, 'Configuration object is required');
      return;
    }

    try {
      const response = await codebolt.mcp.configureMCPServer(name, config);
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to configure MCP server', error);
    }
  }
}
