import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../../types';

// Base LLMInferenceResponse Node - Calls codebolt.notify.llm.sendInferenceResponse
export class BaseLLMInferenceResponseNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/llm/inferenceresponse",
    title: "LLM Inference Response",
    category: "codebolt/notifications/llm",
    description: "Sends an LLM inference response notification using codebolt.notify.llm.sendInferenceResponse",
    icon: "💭",
    color: "#673AB7"
  };

  constructor() {
    super(BaseLLMInferenceResponseNode.metadata.title, BaseLLMInferenceResponseNode.metadata.type);
    this.title = BaseLLMInferenceResponseNode.metadata.title;
    this.size = [220, 140];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Required inputs
    this.addInput("content", 0 as any);
    this.addInput("toolUseId", "string");

    // Optional input
    this.addInput("isError", "boolean");

    // Event output for responseSent
    this.addOutput("responseSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
