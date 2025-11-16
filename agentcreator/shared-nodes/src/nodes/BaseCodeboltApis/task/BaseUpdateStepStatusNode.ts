import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base UpdateStepStatus Node - Calls codebolt.task.updateStepStatus
export class BaseUpdateStepStatusNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/updatestepstatus",
    title: "Update Step Status",
    category: "codebolt/task",
    description: "Updates step status using codebolt.task.updateStepStatus",
    icon: "🔄",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseUpdateStepStatusNode.metadata.title, BaseUpdateStepStatusNode.metadata.type);
    this.title = BaseUpdateStepStatusNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("stepId", "string");
    this.addInput("status", "string");
    this.addInput("taskId", "string");

    // Event output for stepStatusUpdated
    this.addOutput("stepStatusUpdated", LiteGraph.EVENT);

    // Output for updated step object
    this.addOutput("step", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}