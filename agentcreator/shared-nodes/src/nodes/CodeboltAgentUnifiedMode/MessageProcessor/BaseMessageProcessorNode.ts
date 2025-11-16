import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Message Processor Node - Default message processor factory
export class BaseMessageProcessorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/messageprocessor",
    title: "Message Processor",
    category: "unified/agent",
    description: "Create default message processor with basic settings",
    icon: "📨",
    color: "#00BCD4"
  };

  constructor() {
    super(BaseMessageProcessorNode.metadata.title, BaseMessageProcessorNode.metadata.type);
    this.title = BaseMessageProcessorNode.metadata.title;
    this.size = [240, 140];

    // Trigger input for processor creation
    this.addInput("onCreate", LiteGraph.ACTION);

    // Event output for processor creation
    this.addOutput("onCreated", LiteGraph.EVENT);

    // Event output for processor error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for message processor instance
    this.addOutput("processor", "object", {
      extra_info: {
        dataType: "object",
        description: "Created message processor instance"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Processor configuration properties
    this.properties = {
      enableLogging: true,
      enableTemplating: true,
      baseSystemPrompt: "You are a helpful assistant."
    };

    // Add widgets for configuration
    this.addWidget("textarea", "base system prompt", this.properties.baseSystemPrompt, "baseSystemPrompt");
    this.addWidget("toggle", "enable logging", this.properties.enableLogging, "enableLogging");
    this.addWidget("toggle", "enable templating", this.properties.enableTemplating, "enableTemplating");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}