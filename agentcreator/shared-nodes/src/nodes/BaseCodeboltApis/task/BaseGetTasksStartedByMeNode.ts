import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTasksStartedByMe Node - Calls codebolt.task.getTasksStartedByMe
export class BaseGetTasksStartedByMeNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettasksstartedbyme",
    title: "Get Tasks Started By Me",
    category: "codebolt/task",
    description: "Gets tasks started by a specific user using codebolt.task.getTasksStartedByMe",
    icon: "👤",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTasksStartedByMeNode.metadata.title, BaseGetTasksStartedByMeNode.metadata.type);
    this.title = BaseGetTasksStartedByMeNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs
    this.addInput("userId", "string");
    this.addInput("status", "string");

    // Event output for tasksRetrieved
    this.addOutput("tasksRetrieved", LiteGraph.EVENT);

    // Output for tasks array
    this.addOutput("tasks", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}