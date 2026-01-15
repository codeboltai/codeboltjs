import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPConfigureNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/configure",
    title: "Configure MCP Server",
    category: "codebolt/mcp",
    description: "Configures a specific MCP toolbox",
    icon: "⚙️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPConfigureNode.metadata, [360, 220]);
    this.addProperty("name", "", "string");
    this.addProperty("config", "{}", "string");
    this.addInput("name", "string");
    this.addInput("config", "object");
  }
}
