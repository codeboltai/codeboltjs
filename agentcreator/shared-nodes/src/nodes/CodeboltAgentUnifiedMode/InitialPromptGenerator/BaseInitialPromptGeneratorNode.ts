import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Initial Prompt Generator Node - Message processing and preparation
export class BaseInitialPromptGeneratorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/promptgenerator",
    title: "Prompt Generator",
    category: "unified/agent",
    description: "Process and prepare messages for LLM with message modifiers",
    icon: "📝",
    color: "#3F51B5"
  };

  constructor() {
    super(BaseInitialPromptGeneratorNode.metadata.title, BaseInitialPromptGeneratorNode.metadata.type);
    this.title = BaseInitialPromptGeneratorNode.metadata.title;
    this.size = [260, 160];

    // Trigger input for message processing
    this.addInput("onProcess", LiteGraph.ACTION);

    // Input for FlatUserMessage
    this.addInput("message", "object", {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to process"
      }
    } as any);

    // Input for message processors
    this.addInput("processors", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.MESSAGE_MODIFIER,
        description: "Message processors to transform the message"
      }
    } as any);

    // Event output for processing completion
    this.addOutput("onProcessed", LiteGraph.EVENT);

    // Event output for processing error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for processed message
    this.addOutput("processedMessage", "object", {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Processed message ready for LLM"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Generator configuration properties
    this.properties = {
      baseSystemPrompt: "You are a helpful assistant.",
      enableLogging: true,
      enableTemplating: true
    };

    // Add widgets for configuration
    this.addWidget("textarea", "base system prompt", this.properties.baseSystemPrompt, "baseSystemPrompt");
    this.addWidget("toggle", "enable logging", this.properties.enableLogging, "enableLogging");
    this.addWidget("toggle", "enable templating", this.properties.enableTemplating, "enableTemplating");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}