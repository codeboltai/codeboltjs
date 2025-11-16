import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddStepToTask Node - Calls codebolt.task.addStepToTask
export class BaseAddStepToTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/addsteptotask",
    title: "Add Step To Task",
    category: "codebolt/task",
    description: "Adds a step to a task using codebolt.task.addStepToTask",
    icon: "📍",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseAddStepToTaskNode.metadata.title, BaseAddStepToTaskNode.metadata.type);
    this.title = BaseAddStepToTaskNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("taskId", "string");
    this.addInput("stepData", "object");

    // Event output for stepAdded
    this.addOutput("stepAdded", LiteGraph.EVENT);

    // Output for added step object
    this.addOutput("step", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}