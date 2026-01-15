import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base StartSubagentTaskRequestNode - Calls StartSubagentTaskRequestNotify
export class BaseStartSubagentTaskRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/agent/request/startSubagentTask",
    title: "Start Subagent Task Request",
    category: "codebolt/notifications/agent",
    description: "Sends a request to start a subagent task",
    icon: "🤖",
    color: "#FF9800"
  };

  constructor() {
    super(BaseStartSubagentTaskRequestNode.metadata.title, BaseStartSubagentTaskRequestNode.metadata.type);
    this.title = BaseStartSubagentTaskRequestNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data inputs
    this.addInput("parentAgentId", "string");
    this.addInput("subagentId", "string");
    this.addInput("task", "string");

    // Optional data inputs
    this.addInput("priority", "string");
    this.addInput("dependencies", "array");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}