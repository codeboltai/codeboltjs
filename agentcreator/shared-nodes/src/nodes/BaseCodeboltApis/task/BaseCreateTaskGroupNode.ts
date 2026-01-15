import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CreateTaskGroup Node - Calls codebolt.task.createTaskGroup
export class BaseCreateTaskGroupNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/createtaskgroup",
    title: "Create Task Group",
    category: "codebolt/task",
    description: "Creates a task group using codebolt.task.createTaskGroup",
    icon: "📁",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseCreateTaskGroupNode.metadata.title, BaseCreateTaskGroupNode.metadata.type);
    this.title = BaseCreateTaskGroupNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("groupName", "string");
    this.addInput("description", "string");

    // Event output for taskGroupCreated
    this.addOutput("taskGroupCreated", LiteGraph.EVENT);

    // Output for task group object
    this.addOutput("taskGroup", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}