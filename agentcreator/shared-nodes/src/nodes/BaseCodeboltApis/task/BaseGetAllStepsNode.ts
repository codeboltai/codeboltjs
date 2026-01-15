import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetAllSteps Node - Calls codebolt.task.getAllSteps
export class BaseGetAllStepsNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/getallsteps",
    title: "Get All Steps",
    category: "codebolt/task",
    description: "Gets all steps using codebolt.task.getAllSteps",
    icon: "📋",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetAllStepsNode.metadata.title, BaseGetAllStepsNode.metadata.type);
    this.title = BaseGetAllStepsNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data inputs for filtering
    this.addInput("taskId", "string");
    this.addInput("status", "string");

    // Event output for stepsRetrieved
    this.addOutput("stepsRetrieved", LiteGraph.EVENT);

    // Output for steps array
    this.addOutput("steps", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}