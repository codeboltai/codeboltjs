import { BaseMCPExecuteToolNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMCPFailure, emitMCPSuccess, getObjectInput, getStringInput } from './utils.js';

export class MCPExecuteToolNode extends BaseMCPExecuteToolNode {
  constructor() {
    super();
  }

  async onExecute() {
    const toolbox = getStringInput(this, 1, 'toolbox');
    const toolName = getStringInput(this, 2, 'toolName');
    const params = getObjectInput(this, 3, 'params');

    if (!toolbox || !toolName) {
      emitMCPFailure(this, 'Toolbox and tool name are required to execute');
      return;
    }

    try {
      const response = await codebolt.mcp.executeTool(toolbox, toolName, (params ?? {}) as any);
      emitMCPSuccess(this, response);
    } catch (error) {
      emitMCPFailure(this, 'Failed to execute MCP tool', error);
    }
  }
}
