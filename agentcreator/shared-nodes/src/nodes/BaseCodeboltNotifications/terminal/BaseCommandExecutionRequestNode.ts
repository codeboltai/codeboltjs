import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base CommandExecutionRequestNode - Calls CommandExecutionRequestNotify
export class BaseCommandExecutionRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "notifications/terminal/request/execute-command",
    title: "Terminal Command Request",
    category: "codebolt/notifications/terminal",
    description: "Sends a terminal command execution request notification",
    icon: "⌨️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseCommandExecutionRequestNode.metadata.title, BaseCommandExecutionRequestNode.metadata.type);
    this.title = BaseCommandExecutionRequestNode.metadata.title;
    this.size = [240, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required data input for the command
    this.addInput("command", "string");

    // Optional data inputs for boolean flags
    this.addInput("returnEmptyStringOnSuccess", "boolean");
    this.addInput("executeInMain", "boolean");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}