import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTodoRequest Node - Calls todo.GetTodoRequestNotify
export class BaseGetTodoRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/todo/gettodorequest",
    title: "Get Todo Request",
    category: "codebolt/notifications/todo",
    description: "Sends a get todo request notification with optional filters",
    icon: "📋",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetTodoRequestNode.metadata.title, BaseGetTodoRequestNode.metadata.type);
    this.title = BaseGetTodoRequestNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on GetTodoRequestNotify parameters
    this.addInput("filters", "string"); // JSON object for filters
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}