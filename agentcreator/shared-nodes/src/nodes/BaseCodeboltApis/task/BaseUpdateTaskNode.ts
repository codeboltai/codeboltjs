import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UpdateTask Node - Calls codebolt.task.updateTask
export class BaseUpdateTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/updatetask",
    title: "Update Task",
    category: "codebolt/task",
    description: "Updates a task using codebolt.task.updateTask",
    icon: "✏️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseUpdateTaskNode.metadata.title, BaseUpdateTaskNode.metadata.type);
    this.title = BaseUpdateTaskNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("taskId", "string");
    this.addInput("updates", "object");

    // Event output for taskUpdated
    this.addOutput("taskUpdated", LiteGraph.EVENT);

    // Output for updated task object
    this.addOutput("task", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}