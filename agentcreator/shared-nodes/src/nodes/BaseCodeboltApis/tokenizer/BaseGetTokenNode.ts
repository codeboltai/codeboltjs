import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetToken Node - Calls codebolt.tokenizer.getToken
export class BaseGetTokenNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/tokenizer/getToken",
    title: "Get Token",
    category: "codebolt/tokenizer",
    description: "Retrieves a token from the system via WebSocket",
    icon: "🔐",
    color: "#2196F3"
  };

  constructor() {
    super(BaseGetTokenNode.metadata.title, BaseGetTokenNode.metadata.type);
    this.title = BaseGetTokenNode.metadata.title;
    this.size = [180, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for token key
    this.addInput("key", "string");

    // Event output for token retrieval completion
    this.addOutput("tokenRetrieved", LiteGraph.EVENT);

    // Output for get token response
    this.addOutput("response", "object");

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}