import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base EditTodoTaskResponse Node - Calls todo.EditTodoTaskResponseNotify
export class BaseEditTodoTaskResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/todo/edittodotaskresponse",
    title: "Edit Todo Task Response",
    category: "codebolt/notifications/todo",
    description: "Sends an edit todo task response notification",
    icon: "✅",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseEditTodoTaskResponseNode.metadata.title, BaseEditTodoTaskResponseNode.metadata.type);
    this.title = BaseEditTodoTaskResponseNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs based on EditTodoTaskResponseNotify parameters
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