import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base AddToken Node - Calls codebolt.tokenizer.addToken
export class BaseAddTokenNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/tokenizer/addToken",
    title: "Add Token",
    category: "codebolt/tokenizer",
    description: "Adds a token to the system via WebSocket",
    icon: "🔑",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAddTokenNode.metadata.title, BaseAddTokenNode.metadata.type);
    this.title = BaseAddTokenNode.metadata.title;
    this.size = [180, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for token key
    this.addInput("key", "string");

    // Event output for token addition completion
    this.addOutput("tokenAdded", LiteGraph.EVENT);

    // Output for add token response
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}