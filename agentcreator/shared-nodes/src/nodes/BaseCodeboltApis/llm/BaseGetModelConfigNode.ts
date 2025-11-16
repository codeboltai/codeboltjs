import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from '../../../types';

// Base GetModelConfig Node - Calls codebolt.llm.getModelConfig
export class BaseGetModelConfigNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/llm/getModelConfig",
    title: "Get LLM Model Config",
    category: "codebolt/llm",
    description: "Gets the model configuration for a specific model or the default application model",
    icon: "⚙️",
    color: "#607D8B"
  };

  constructor() {
    super(BaseGetModelConfigNode.metadata.title, BaseGetModelConfigNode.metadata.type);
    this.title = BaseGetModelConfigNode.metadata.title;
    this.size = [240, 100];

    // Generic action input for event triggering
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Optional input for model ID (if not provided, returns default model config)
    this.addInput("modelId", "string");

    // Event output for config retrieval completion
    this.addOutput("configRetrieved", LiteGraph.EVENT);

    // Output for model configuration object
    this.addOutput("config", "object");

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message if any
    this.addOutput("error", "string");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}