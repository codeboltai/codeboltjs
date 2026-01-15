import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CompleteTask Node - Calls codebolt.task.completeTask
export class BaseCompleteTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/completetask",
    title: "Complete Task",
    category: "codebolt/task",
    description: "Completes a task using codebolt.task.completeTask",
    icon: "✅",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseCompleteTaskNode.metadata.title, BaseCompleteTaskNode.metadata.type);
    this.title = BaseCompleteTaskNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for taskCompleted
    this.addOutput("taskCompleted", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}