import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base SubagentTaskCompletedNode - Calls SubagentTaskCompletedNotify
export class BaseSubagentTaskCompletedNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/agent/request/subagentTaskCompleted",
    title: "Subagent Task Completed",
    category: "codebolt/notifications/agent",
    description: "Notifies that a subagent task has been completed",
    icon: "✅",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseSubagentTaskCompletedNode.metadata.title, BaseSubagentTaskCompletedNode.metadata.type);
    this.title = BaseSubagentTaskCompletedNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data inputs
    this.addInput("parentAgentId", "string");
    this.addInput("subagentId", "string");
    this.addInput("taskId", "string");
    this.addInput("result", "object");
    this.addInput("status", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}