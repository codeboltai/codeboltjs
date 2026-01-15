import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CreateTask Node - Calls codebolt.task.createTask
export class BaseCreateTaskNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/createtask",
    title: "Create Task",
    category: "codebolt/task",
    description: "Creates a new task using codebolt.task.createTask",
    icon: "📋",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseCreateTaskNode.metadata.title, BaseCreateTaskNode.metadata.type);
    this.title = BaseCreateTaskNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("name", "string");
    this.addInput("threadId", "string");
    this.addInput("taskType", "string");
    this.addInput("executionType", "string");

    // Event output for taskCreated
    this.addOutput("taskCreated", LiteGraph.EVENT);

    // Output for created task object
    this.addOutput("task", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}