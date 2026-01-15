import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base LLMSendTokenCountResponse Node - Calls codebolt.notify.llm.sendTokenCountResponse
export class BaseLLMSendTokenCountResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/llm/sendtokencountresponse",
    title: "Send Token Count Response",
    category: "codebolt/notifications/llm",
    description: "Sends a token count response notification using codebolt.notify.llm.sendTokenCountResponse",
    icon: "🔢",
    color: "#673AB7"
  };

  constructor() {
    super(BaseLLMSendTokenCountResponseNode.metadata.title, BaseLLMSendTokenCountResponseNode.metadata.type);
    this.title = BaseLLMSendTokenCountResponseNode.metadata.title;
    this.size = [240, 160];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required inputs
    this.addInput("content", 0 as any);
    this.addInput("toolUseId", "string");

    // Optional inputs
    this.addInput("isError", "boolean");
    this.addInput("data", "object"); // Contains tokenCount, model, encoding

    // Event output for responseSent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
