import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base OpenDebugBrowser Node - Calls codebolt.debug.openDebugBrowser
export class BaseOpenDebugBrowserNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/debug/openDebugBrowser",
    title: "Open Debug Browser",
    category: "codebolt/debug",
    description: "Requests to open a debug browser at the specified URL and port",
    icon: "🌐",
    color: "#2196F3"
  };

  constructor() {
    super(BaseOpenDebugBrowserNode.metadata.title, BaseOpenDebugBrowserNode.metadata.type);
    this.title = BaseOpenDebugBrowserNode.metadata.title;
    this.size = [200, 120];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data inputs for debug browser
    this.addInput("url", "string");
    this.addInput("port", "number");

    // Event output for debug browser opening completion
    this.addOutput("browserOpened", LiteGraph.EVENT);

    // Output for open debug browser response
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Set default values
    this.properties = {
      url: "http://localhost",
      port: 3000
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}