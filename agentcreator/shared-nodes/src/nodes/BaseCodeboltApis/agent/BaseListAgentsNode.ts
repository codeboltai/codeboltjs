import { NodeMetadata } from '../../../types';
import { BaseAgentServiceNode } from './BaseAgentServiceNode';

export class BaseListAgentsNode extends BaseAgentServiceNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agent/list",
    title: "List Agents",
    category: "codebolt/agent",
    description: "Retrieves agents list by type",
    icon: "📋",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseListAgentsNode.metadata);
    this.addProperty("agentType", "DOWNLOADED", "string");
    this.addInput("agentType", "string");
  }
}
