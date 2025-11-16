import { NodeMetadata } from '../../../types';
import { BaseMCPActionNode } from './BaseMCPActionNode';

export class BaseMCPMentionedServersNode extends BaseMCPActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/mcp/getMentioned",
    title: "Get Mentioned MCP Servers",
    category: "codebolt/mcp",
    description: "Fetches MCP toolboxes mentioned in a user message",
    icon: "📎",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseMCPMentionedServersNode.metadata, [360, 200]);
    this.addProperty("userMessage", "", "string");
    this.addInput("userMessage", "object");
  }
}
