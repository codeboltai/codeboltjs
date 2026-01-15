import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ExecuteCommandRunUntilError Node - Calls codebolt.terminal.executeCommandRunUntilError
export class BaseExecuteCommandRunUntilErrorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/terminal/executeCommandRunUntilError",
    title: "Execute Command Until Error",
    category: "codebolt/terminal",
    description: "Executes a terminal command and keeps running until an error occurs using codebolt.terminal.executeCommandRunUntilError",
    icon: "🔄",
    color: "#FF9800"
  };

  constructor() {
    super(BaseExecuteCommandRunUntilErrorNode.metadata.title, BaseExecuteCommandRunUntilErrorNode.metadata.type);
    this.title = BaseExecuteCommandRunUntilErrorNode.metadata.title;
    this.size = [260, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the command to execute
    this.addInput("command", "string");

    // Optional input for executeInMain parameter
    this.addInput("executeInMain", "boolean");

    // Event output for command completion/error
    this.addOutput("commandError", LiteGraph.EVENT);

    // Output for error result
    this.addOutput("error", "string");

    // Output for success status (false when error occurs)
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}