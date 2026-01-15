import { NodeMetadata } from '../../../types';
import { BaseAgentServiceNode } from './BaseAgentServiceNode';

export class BaseStartAgentNode extends BaseAgentServiceNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agent/start",
    title: "Start Agent",
    category: "codebolt/agent",
    description: "Starts an agent with a given task",
    icon: "🚀",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseStartAgentNode.metadata);
    this.addProperty("agentId", "", "string");
    this.addProperty("task", "", "string");

    this.addInput("agentId", "string");
    this.addInput("task", "string");
  }
}
