import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPExecuteToolNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/executeTool",
    title: "Execute MCP Tool",
    category: "codebolt/mcp",
    description: "Executes a specific MCP tool with parameters",
    icon: "🚀",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPExecuteToolNode.metadata, [360, 220]);
    this.addProperty("toolbox", "", "string");
    this.addProperty("toolName", "", "string");
    this.addProperty("params", "{}", "string");
    this.addInput("toolbox", "string");
    this.addInput("toolName", "string");
    this.addInput("params", "object");
  }
}
