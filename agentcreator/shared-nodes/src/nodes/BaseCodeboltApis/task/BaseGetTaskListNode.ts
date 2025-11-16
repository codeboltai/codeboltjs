import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTaskList Node - Calls codebolt.task.getTaskList
export class BaseGetTaskListNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettasklist",
    title: "Get Task List",
    category: "codebolt/task",
    description: "Retrieves a list of tasks using codebolt.task.getTaskList",
    icon: "📝",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTaskListNode.metadata.title, BaseGetTaskListNode.metadata.type);
    this.title = BaseGetTaskListNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data inputs for filtering
    this.addInput("threadId", "string");
    this.addInput("status", "string");

    // Event output for taskListRetrieved
    this.addOutput("taskListRetrieved", LiteGraph.EVENT);

    // Output for task list array
    this.addOutput("tasks", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}