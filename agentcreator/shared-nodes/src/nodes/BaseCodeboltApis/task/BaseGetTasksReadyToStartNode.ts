import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTasksReadyToStart Node - Calls codebolt.task.getTasksReadyToStart
export class BaseGetTasksReadyToStartNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettasksreadytostart",
    title: "Get Tasks Ready To Start",
    category: "codebolt/task",
    description: "Gets tasks that are ready to start using codebolt.task.getTasksReadyToStart",
    icon: "🚀",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTasksReadyToStartNode.metadata.title, BaseGetTasksReadyToStartNode.metadata.type);
    this.title = BaseGetTasksReadyToStartNode.metadata.title;
    this.size = [220, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional data inputs for filtering
    this.addInput("threadId", "string");
    this.addInput("environmentType", "string");

    // Event output for readyTasksRetrieved
    this.addOutput("readyTasksRetrieved", LiteGraph.EVENT);

    // Output for ready tasks array
    this.addOutput("tasks", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}