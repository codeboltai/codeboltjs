import { NodeMetadata } from '../../../types';
import { BaseAgentServiceNode } from './BaseAgentServiceNode';

export class BaseAgentsDetailNode extends BaseAgentServiceNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agent/details",
    title: "Agents Detail",
    category: "codebolt/agent",
    description: "Fetches details for specific agents",
    icon: "🧾",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAgentsDetailNode.metadata, [320, 180]);
    this.addProperty("agentList", "[]", "string");
    this.addInput("agentList", "array");
  }
}
