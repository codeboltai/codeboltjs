import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for tool injection modifier properties
interface ToolInjectionModifierProperties {
  toolsLocation: 'beginning' | 'end' | 'smart';
  includeToolDescriptions: boolean;
  maxToolsInMessage: number;
  giveToolExamples: boolean;
  maxToolExamples: number;
  enabledCategories: string[];
}

// Base Tool Injection Modifier Node - Injects available tools into the conversation
export class BaseToolInjectionModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/toolInjection",
    title: "Tool Injection",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Injects available MCP tools into the conversation",
    icon: "🛠️",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseToolInjectionModifierNode.metadata.title, BaseToolInjectionModifierNode.metadata.type);
    this.title = BaseToolInjectionModifierNode.metadata.title;
    this.size = [280, 320];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with tool information"
      }
    } as any);

    // Optional input for tool filters
    this.addInput("toolFilters", "string", {
      extra_info: {
        dataType: "string",
        description: "Comma-separated list of tool categories to include (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with tool information injected"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for injected tools
    this.addOutput("injectedTools", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.TOOL_LIST,
        description: "Tools that were injected into the message"
      }
    } as any);

    // Output for tool configuration
    this.addOutput("toolConfig", DATA_TYPES.TOOL_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.TOOL_CONFIG,
        description: "Tool injection configuration used"
      }
    } as any);

    // Default properties
    this.properties = {
      toolsLocation: 'smart' as const,
      includeToolDescriptions: true,
      maxToolsInMessage: 15,
      giveToolExamples: false,
      maxToolExamples: 3,
      enabledCategories: []
    } as ToolInjectionModifierProperties;

    // Configuration widgets
    this.addWidget("combo", "Tools Location", "smart", "toolsLocation", {
      values: ["beginning", "end", "smart"]
    });

    this.addWidget("toggle", "Tool Descriptions", true, "includeToolDescriptions", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Tools", 15, "maxToolsInMessage", {
      min: 1,
      max: 50,
      step: 1
    });

    this.addWidget("toggle", "Tool Examples", false, "giveToolExamples", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Examples", 3, "maxToolExamples", {
      min: 1,
      max: 10,
      step: 1
    });

    this.addWidget("text", "Enabled Categories", "", "enabledCategoriesInput");

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "enabledCategoriesInput") {
      this.properties.enabledCategories = (value as string).split(',').map(cat => cat.trim()).filter(cat => cat);
    }
    return true;
  }

  // Get the configuration for the tool injection modifier
  getToolInjectionConfig(): ToolInjectionModifierProperties {
    return {
      toolsLocation: this.properties.toolsLocation as 'beginning' | 'end' | 'smart',
      includeToolDescriptions: this.properties.includeToolDescriptions as boolean,
      maxToolsInMessage: this.properties.maxToolsInMessage as number,
      giveToolExamples: this.properties.giveToolExamples as boolean,
      maxToolExamples: this.properties.maxToolExamples as number,
      enabledCategories: this.properties.enabledCategories as string[]
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}