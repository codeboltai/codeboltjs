import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTaskMessages Node - Calls codebolt.task.getTaskMessages
export class BaseGetTaskMessagesNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/task/gettaskmessages",
    title: "Get Task Messages",
    category: "codebolt/task",
    description: "Gets messages for a task using codebolt.task.getTaskMessages",
    icon: "💬",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseGetTaskMessagesNode.metadata.title, BaseGetTaskMessagesNode.metadata.type);
    this.title = BaseGetTaskMessagesNode.metadata.title;
    this.size = [200, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for task ID
    this.addInput("taskId", "string");

    // Event output for messagesRetrieved
    this.addOutput("messagesRetrieved", LiteGraph.EVENT);

    // Output for messages array
    this.addOutput("messages", "array");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}