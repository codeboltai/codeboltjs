import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPLocalServersNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/getLocal",
    title: "Get Local MCP Servers",
    category: "codebolt/mcp",
    description: "Fetches locally available MCP toolboxes",
    icon: "💾",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPLocalServersNode.metadata);
  }
}
