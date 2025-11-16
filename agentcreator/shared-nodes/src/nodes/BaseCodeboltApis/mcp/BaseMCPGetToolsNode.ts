import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPGetToolsNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/getTools",
    title: "Get MCP Tools",
    category: "codebolt/mcp",
    description: "Gets detailed information about tools",
    icon: "🛠️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPGetToolsNode.metadata, [360, 200]);
    this.addProperty("tools", "[]", "string");
    this.addInput("tools", "array");
  }
}
