import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base LLMGetTokenCount Node - Calls codebolt.notify.llm.getTokenCount
export class BaseLLMGetTokenCountNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/llm/gettokencount",
    title: "Get Token Count",
    category: "codebolt/notifications/llm",
    description: "Sends a token count request notification using codebolt.notify.llm.getTokenCount",
    icon: "#️⃣",
    color: "#673AB7"
  };

  constructor() {
    super(BaseLLMGetTokenCountNode.metadata.title, BaseLLMGetTokenCountNode.metadata.type);
    this.title = BaseLLMGetTokenCountNode.metadata.title;
    this.size = [220, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required input - text to count tokens for
    this.addInput("text", "string");

    // Optional inputs
    this.addInput("model", "string");
    this.addInput("encoding", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  }
