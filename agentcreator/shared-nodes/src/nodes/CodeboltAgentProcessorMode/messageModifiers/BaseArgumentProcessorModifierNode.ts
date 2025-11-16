import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for argument processor modifier properties
interface ArgumentProcessorModifierProperties {
  appendRawInvocation: boolean;
  argumentSeparator: string;
  includeCommandName: boolean;
  formatStyle: 'simple' | 'detailed' | 'json';
}

// Base Argument Processor Modifier Node - Processes command invocation arguments
export class BaseArgumentProcessorModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/argumentProcessor",
    title: "Argument Processor",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Appends command invocation details to user messages",
    icon: "⚙️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseArgumentProcessorModifierNode.metadata.title, BaseArgumentProcessorModifierNode.metadata.type);
    this.title = BaseArgumentProcessorModifierNode.metadata.title;
    this.size = [280, 220];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with argument processing"
      }
    } as any);

    // Optional input for custom arguments
    this.addInput("customArguments", "string", {
      extra_info: {
        dataType: "string",
        description: "Custom arguments to process (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with processed arguments"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for processed arguments
    this.addOutput("processedArguments", DATA_TYPES.ARGUMENT_PROCESSOR, {
      extra_info: {
        dataType: DATA_TYPES.ARGUMENT_PROCESSOR,
        description: "Processed argument configuration"
      }
    } as any);

    // Output for formatted arguments string
    this.addOutput("argumentString", "string", {
      extra_info: {
        dataType: "string",
        description: "Formatted arguments as string"
      }
    } as any);

    // Default properties
    this.properties = {
      appendRawInvocation: true,
      argumentSeparator: ", ",
      includeCommandName: true,
      formatStyle: 'simple' as const
    } as ArgumentProcessorModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Append Raw", true, "appendRawInvocation", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Argument Separator", ", ", "argumentSeparator");

    this.addWidget("toggle", "Include Command", true, "includeCommandName", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Format Style", "simple", "formatStyle", {
      values: ["simple", "detailed", "json"]
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the argument processor modifier
  getArgumentProcessorConfig(): ArgumentProcessorModifierProperties {
    return {
      appendRawInvocation: this.properties.appendRawInvocation as boolean,
      argumentSeparator: this.properties.argumentSeparator as string,
      includeCommandName: this.properties.includeCommandName as boolean,
      formatStyle: this.properties.formatStyle as 'simple' | 'detailed' | 'json'
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}