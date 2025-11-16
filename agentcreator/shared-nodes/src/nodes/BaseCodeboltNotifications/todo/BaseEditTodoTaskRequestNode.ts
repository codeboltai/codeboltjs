import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base EditTodoTaskRequest Node - Calls todo.EditTodoTaskRequestNotify
export class BaseEditTodoTaskRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/todo/edittodotaskrequest",
    title: "Edit Todo Task Request",
    category: "codebolt/notifications/todo",
    description: "Sends an edit todo task request notification with optional task updates",
    icon: "✏️",
    color: "#FF9800"
  };

  constructor() {
    super(BaseEditTodoTaskRequestNode.metadata.title, BaseEditTodoTaskRequestNode.metadata.type);
    this.title = BaseEditTodoTaskRequestNode.metadata.title;
    this.size = [240, 220];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on EditTodoTaskRequestNotify parameters
    this.addInput("taskId", "string");
    this.addInput("title", "string");
    this.addInput("description", "string");
    this.addInput("phase", "string");
    this.addInput("category", "string");
    this.addInput("priority", "string");
    this.addInput("tags", "string"); // JSON array or comma-separated
    this.addInput("status", "string");
    this.addInput("toolUseId", "string");

    // Event output for request sent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}