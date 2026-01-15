import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base DeleteTask Node - Calls codebolt.task.deleteTask
export class BaseDeleteTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/deletetask",
    title: "Delete Task",
    category: "codebolt/task",
    description: "Deletes a task using codebolt.task.deleteTask",
    icon: "🗑️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseDeleteTaskNode.metadata.title, BaseDeleteTaskNode.metadata.type);
    this.title = BaseDeleteTaskNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for taskDeleted
    this.addOutput("taskDeleted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}