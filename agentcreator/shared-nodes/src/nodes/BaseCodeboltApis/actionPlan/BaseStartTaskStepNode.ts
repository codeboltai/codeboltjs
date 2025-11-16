import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base StartTaskStep Node - Calls codebolt.actionPlan.startTaskStep
export class BaseStartTaskStepNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/startTaskStep",
    title: "Start Task Step",
    category: "codebolt/actionPlan",
    description: "Starts/executes a task step in an action plan",
    icon: "▶️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseStartTaskStepNode.metadata.title, BaseStartTaskStepNode.metadata.type);
    this.title = BaseStartTaskStepNode.metadata.title;
    this.size = [200, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for task execution
    this.addInput("planId", "string");
    this.addInput("taskId", "string");

    // Event output for task start completion
    this.addOutput("taskStarted", LiteGraph.EVENT);

    // Output for task execution status
    this.addOutput("taskStatus", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}