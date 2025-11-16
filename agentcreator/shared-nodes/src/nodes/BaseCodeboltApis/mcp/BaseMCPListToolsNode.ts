import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPListToolsNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/listTools",
    title: "List MCP Tools",
    category: "codebolt/mcp",
    description: "Lists tools from specified toolboxes",
    icon: "📚",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPListToolsNode.metadata, [360, 200]);
    this.addProperty("toolBoxes", "[]", "string");
    this.addInput("toolBoxes", "array");
  }
}
