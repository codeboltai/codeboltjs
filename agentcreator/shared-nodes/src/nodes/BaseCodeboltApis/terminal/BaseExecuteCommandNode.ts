import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ExecuteCommand Node - Calls codebolt.terminal.executeCommand
export class BaseExecuteCommandNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/terminal/executeCommand",
    title: "Execute Command",
    category: "codebolt/terminal",
    description: "Executes a terminal command using codebolt.terminal.executeCommand",
    icon: "⚡",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseExecuteCommandNode.metadata.title, BaseExecuteCommandNode.metadata.type);
    this.title = BaseExecuteCommandNode.metadata.title;
    this.size = [240, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the command to execute
    this.addInput("command", "string");

    // Optional input for returnEmptyStringOnSuccess parameter
    this.addInput("returnEmptyStringOnSuccess", "boolean");

    // Event output for command completion
    this.addOutput("commandComplete", LiteGraph.EVENT);

    // Output for command result/output
    this.addOutput("result", "string");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}