import { NodeMetadata } from '../../../types';
import { BaseAgentServiceNode } from './BaseAgentServiceNode';

export class BaseFindAgentNode extends BaseAgentServiceNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agent/find",
    title: "Find Agent",
    category: "codebolt/agent",
    description: "Finds agents suitable for a task",
    icon: "🕵️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseFindAgentNode.metadata, [360, 220]);
    this.addProperty("task", "", "string");
    this.addProperty("maxResult", 1, "number");
    this.addProperty("agents", "[]", "string");
    this.addProperty("location", "ALL", "string");
    this.addProperty("source", "USE_VECTOR_DB", "string");

    this.addInput("task", "string");
    this.addInput("maxResult", "number");
    this.addInput("agents", "array");
    this.addInput("location", "string");
    this.addInput("source", "string");
  }
}
