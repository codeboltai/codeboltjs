import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CompleteStep Node - Calls codebolt.task.completeStep
export class BaseCompleteStepNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/completestep",
    title: "Complete Step",
    category: "codebolt/task",
    description: "Completes a step using codebolt.task.completeStep",
    icon: "✅",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseCompleteStepNode.metadata.title, BaseCompleteStepNode.metadata.type);
    this.title = BaseCompleteStepNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("stepId", "string");
    this.addInput("taskId", "string");
    this.addInput("result", "string");

    // Event output for stepCompleted
    this.addOutput("stepCompleted", LiteGraph.EVENT);

    // Output for completed step object
    this.addOutput("step", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}