import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CanTaskStart Node - Calls codebolt.task.canTaskStart
export class BaseCanTaskStartNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/cantaskstart",
    title: "Can Task Start",
    category: "codebolt/task",
    description: "Checks if a task can start using codebolt.task.canTaskStart",
    icon: "❓",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseCanTaskStartNode.metadata.title, BaseCanTaskStartNode.metadata.type);
    this.title = BaseCanTaskStartNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for canStartChecked
    this.addOutput("canStartChecked", LiteGraph.EVENT);

    // Output for can start boolean
    this.addOutput("canStart", "boolean");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}