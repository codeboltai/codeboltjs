import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetTodoResponse Node - Calls todo.GetTodoResponseNotify
export class BaseGetTodoResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/todo/gettodoresponse",
    title: "Get Todo Response",
    category: "codebolt/notifications/todo",
    description: "Sends a get todo response notification",
    icon: "📊",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseGetTodoResponseNode.metadata.title, BaseGetTodoResponseNode.metadata.type);
    this.title = BaseGetTodoResponseNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on GetTodoResponseNotify parameters
    this.addInput("content", "object");
    this.addInput("isError", "boolean");
    this.addInput("toolUseId", "string");

    // Event output for response sent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}