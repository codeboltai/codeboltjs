import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base StartTask Node - Calls codebolt.task.startTask
export class BaseStartTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/starttask",
    title: "Start Task",
    category: "codebolt/task",
    description: "Starts a task using codebolt.task.startTask",
    icon: "▶️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseStartTaskNode.metadata.title, BaseStartTaskNode.metadata.type);
    this.title = BaseStartTaskNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for taskStarted
    this.addOutput("taskStarted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}