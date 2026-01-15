import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base LLMInferenceRequest Node - Calls codebolt.notify.llm.sendInferenceRequest
export class BaseLLMInferenceRequestNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/notifications/llm/inferencerequest",
    title: "LLM Inference Request",
    category: "codebolt/notifications/llm",
    description: "Sends an LLM inference request notification using codebolt.notify.llm.sendInferenceRequest",
    icon: "🧠",
    color: "#673AB7"
  };

  constructor() {
    super(BaseLLMInferenceRequestNode.metadata.title, BaseLLMInferenceRequestNode.metadata.type);
    this.title = BaseLLMInferenceRequestNode.metadata.title;
    this.size = [260, 220];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for inference parameters (all wrapped in a single object)
    this.addInput("data", "object");

    // Optional individual inputs for common parameters
    this.addInput("messages", "array");
    this.addInput("tools", "array");
    this.addInput("tool_choice", "string");
    this.addInput("full", "boolean");
    this.addInput("llmrole", "string");
    this.addInput("max_tokens", "number");
    this.addInput("temperature", "number");
    this.addInput("stream", "boolean");
    this.addInput("prompt", "string");

    // Event output for requestSent
    this.addOutput("requestSent", LiteGraph.EVENT);

    // Output for success status
    this.addOutput("success", "boolean");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}
