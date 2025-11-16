import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPGetEnabledNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/getEnabled",
    title: "Get Enabled MCP Servers",
    category: "codebolt/mcp",
    description: "Fetches enabled MCP toolboxes",
    icon: "🧰",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPGetEnabledNode.metadata);
  }
}
