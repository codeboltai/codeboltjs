import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Debug Node - Calls codebolt.debug.debug
export class BaseDebugNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/debug/debug",
    title: "Debug Log",
    category: "codebolt/debug",
    description: "Sends a log message to the debug websocket",
    icon: "🐛",
    color: "#FF5722"
  };

  constructor() {
    super(BaseDebugNode.metadata.title, BaseDebugNode.metadata.type);
    this.title = BaseDebugNode.metadata.title;
    this.size = [160, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for debug log
    this.addInput("log", "string");
    this.addInput("type", "string"); // "info", "error", "warning"

    // Event output for debug log completion
    this.addOutput("logSent", LiteGraph.EVENT);

    // Output for debug add log response
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Set default values
    this.properties = {
      type: "info"
    };

    // Add widget for log type selection
    this.addWidget("combo", "Log Type", "info", "type", {
      values: ["info", "error", "warning"]
    });
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}