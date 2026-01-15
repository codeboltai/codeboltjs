import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTaskDetail Node - Calls codebolt.task.getTaskDetail
export class BaseGetTaskDetailNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettaskdetail",
    title: "Get Task Detail",
    category: "codebolt/task",
    description: "Gets detailed information about a task using codebolt.task.getTaskDetail",
    icon: "📄",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTaskDetailNode.metadata.title, BaseGetTaskDetailNode.metadata.type);
    this.title = BaseGetTaskDetailNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for taskDetailRetrieved
    this.addOutput("taskDetailRetrieved", LiteGraph.EVENT);

    // Output for task detail object
    this.addOutput("task", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}