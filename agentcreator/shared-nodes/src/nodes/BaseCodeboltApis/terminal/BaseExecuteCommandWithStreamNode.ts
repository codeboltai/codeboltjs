import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base ExecuteCommandWithStream Node - Calls codebolt.terminal.executeCommandWithStream
export class BaseExecuteCommandWithStreamNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/terminal/executeCommandWithStream",
    title: "Execute Command With Stream",
    category: "codebolt/terminal",
    description: "Executes a terminal command and streams the output using codebolt.terminal.executeCommandWithStream",
    icon: "📡",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseExecuteCommandWithStreamNode.metadata.title, BaseExecuteCommandWithStreamNode.metadata.type);
    this.title = BaseExecuteCommandWithStreamNode.metadata.title;
    this.size = [260, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for the command to execute
    this.addInput("command", "string");

    // Optional input for executeInMain parameter
    this.addInput("executeInMain", "boolean");

    // Event output for when streaming starts
    this.addOutput("streamStarted", LiteGraph.EVENT);

    // Event output for each stream chunk
    this.addOutput("onStreamOutput", LiteGraph.EVENT);

    // Event output for when streaming ends
    this.addOutput("streamFinished", LiteGraph.EVENT);

    // Event output for stream errors
    this.addOutput("onStreamError", LiteGraph.EVENT);

    // Output for stream data
    this.addOutput("output", "string");

    // Output for error data
    this.addOutput("error", "string");

    // Output for stream emitter (for advanced usage)
    this.addOutput("streamEmitter", "object");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}