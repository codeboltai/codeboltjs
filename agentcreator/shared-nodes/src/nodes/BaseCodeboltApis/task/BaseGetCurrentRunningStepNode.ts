import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetCurrentRunningStep Node - Calls codebolt.task.getCurrentRunningStep
export class BaseGetCurrentRunningStepNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/getcurrentrunningstep",
    title: "Get Current Running Step",
    category: "codebolt/task",
    description: "Gets the currently running step using codebolt.task.getCurrentRunningStep",
    icon: "🏃",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetCurrentRunningStepNode.metadata.title, BaseGetCurrentRunningStepNode.metadata.type);
    this.title = BaseGetCurrentRunningStepNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data inputs for filtering
    this.addInput("taskId", "string");
    this.addInput("agentId", "string");

    // Event output for currentStepRetrieved
    this.addOutput("currentStepRetrieved", LiteGraph.EVENT);

    // Output for current step object
    this.addOutput("step", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}