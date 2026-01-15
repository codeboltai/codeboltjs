import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base Inference Node - Calls codebolt.llm.inference
export class BaseInferenceNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/llm/inference",
    title: "LLM Inference",
    category: "codebolt/llm",
    description: "Sends an inference request to the LLM using OpenAI message format with tools support",
    icon: "🧠",
    color: "#673AB7"
  };

  constructor() {
    super(BaseInferenceNode.metadata.title, BaseInferenceNode.metadata.type);
    this.title = BaseInferenceNode.metadata.title;
    this.size = [260, 200];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Data input for inference parameters
    this.addInput("messages", "array"); // Array of conversation messages
    this.addInput("tools", "array"); // Available tools for the model to use
    this.addInput("tool_choice", "string"); // How the model should use tools
    this.addInput("llmrole", "string"); // Role of the LLM to determine which model to use
    this.addInput("max_tokens", "number"); // Maximum number of tokens to generate
    this.addInput("temperature", "number"); // Temperature for response generation
    this.addInput("stream", "boolean"); // Whether to stream the response
    this.addInput("full", "boolean"); // Whether to return full response

    // Event output for inference completion
    this.addOutput("inferenceComplete", LiteGraph.EVENT);

    // Output for LLM completion response
    this.addOutput("completion", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Set default values
    this.properties = {
      tool_choice: "auto",
      llmrole: "default",
      max_tokens: 1000,
      temperature: 0.7,
      stream: false,
      full: false
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}