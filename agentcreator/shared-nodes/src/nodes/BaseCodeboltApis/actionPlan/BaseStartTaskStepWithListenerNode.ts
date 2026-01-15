import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base StartTaskStepWithListener Node - Calls codebolt.actionPlan.startTaskStepWithListener
export class BaseStartTaskStepWithListenerNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/actionPlan/startTaskStepWithListener",
    title: "Start Task Step With Listener",
    category: "codebolt/actionPlan",
    description: "Starts/executes a task step in an action plan with event listener for real-time updates",
    icon: "🎧",
    color: "#673AB7"
  };

  constructor() {
    super(BaseStartTaskStepWithListenerNode.metadata.title, BaseStartTaskStepWithListenerNode.metadata.type);
    this.title = BaseStartTaskStepWithListenerNode.metadata.title;
    this.size = [260, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for task execution
    this.addInput("planId", "string");
    this.addInput("taskId", "string");

    // Event outputs
    this.addOutput("taskStarted", LiteGraph.EVENT); // When task initially starts
    this.addOutput("onTaskUpdate", LiteGraph.EVENT); // For real-time updates
    this.addOutput("taskCompleted", LiteGraph.EVENT); // When task finishes

    // Output for task execution status/response
    this.addOutput("taskResponse", "object");

    // Output for cleanup function (to remove listener)
    this.addOutput("cleanupFunction", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}