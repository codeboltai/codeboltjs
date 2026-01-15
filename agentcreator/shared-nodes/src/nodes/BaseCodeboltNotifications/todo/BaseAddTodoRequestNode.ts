import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddTodoRequest Node - Calls todo.AddTodoRequestNotify
export class BaseAddTodoRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/todo/addtodorequest",
    title: "Add Todo Request",
    category: "codebolt/notifications/todo",
    description: "Sends an add todo request notification with optional task details",
    icon: "➕",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseAddTodoRequestNode.metadata.title, BaseAddTodoRequestNode.metadata.type);
    this.title = BaseAddTodoRequestNode.metadata.title;
    this.size = [240, 200];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on AddTodoRequestNotify parameters
    this.addInput("title", "string");
    this.addInput("agentId", "string");
    this.addInput("description", "string");
    this.addInput("phase", "string");
    this.addInput("category", "string");
    this.addInput("priority", "string");
    this.addInput("tags", "string"); // JSON array or comma-separated
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}