import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPSearchServersNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/search",
    title: "Search MCP Servers",
    category: "codebolt/mcp",
    description: "Search available MCP toolboxes by query",
    icon: "🔍",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPSearchServersNode.metadata, [340, 160]);
    this.addProperty("query", "", "string");
    this.addInput("query", "string");
  }
}
