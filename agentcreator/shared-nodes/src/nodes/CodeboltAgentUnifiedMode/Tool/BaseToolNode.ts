import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Tool Node - Custom tool creation and execution
export class BaseToolNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/tool",
    title: "Tool",
    category: "unified/agent",
    description: "Create and execute custom tools with validation",
    icon: "🔧",
    color: "#FF9800"
  };

  constructor() {
    super(BaseToolNode.metadata.title, BaseToolNode.metadata.type);
    this.title = BaseToolNode.metadata.title;
    this.size = [280, 220];

    // Trigger input for tool creation/execution
    this.addInput("onExecute", LiteGraph.ACTION);

    // Input for tool configuration
    this.addInput("toolConfig", "object", {
      extra_info: {
        dataType: DATA_TYPES.TOOL_CONFIG,
        description: "Tool configuration with schemas and execution function"
      }
    } as any);

    // Input for tool execution data
    this.addInput("input", "object", {
      extra_info: {
        dataType: "object",
        description: "Input data for tool execution"
      }
    } as any);

    // Input for execution context
    this.addInput("context", "object", {
      extra_info: {
        dataType: DATA_TYPES.EXECUTION_CONTEXT,
        description: "Execution context with session information"
      }
    } as any);

    // Event output for tool creation
    this.addOutput("onCreated", LiteGraph.EVENT);

    // Event output for tool execution completion
    this.addOutput("onExecuted", LiteGraph.EVENT);

    // Event output for tool error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for tool instance
    this.addOutput("tool", "object", {
      extra_info: {
        dataType: "object",
        description: "Created tool instance"
      }
    } as any);

    // Output for OpenAI tool format
    this.addOutput("openAITool", "object", {
      extra_info: {
        dataType: "object",
        description: "Tool in OpenAI function format"
      }
    } as any);

    // Output for execution result
    this.addOutput("result", "object", {
      extra_info: {
        dataType: DATA_TYPES.TOOL_RESULT,
        description: "Tool execution result with success status"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Tool configuration properties
    this.properties = {
      toolId: "custom_tool",
      toolDescription: "A custom tool for specific tasks",
      enableValidation: true,
      enableLogging: true
    };

    // Add widgets for configuration
    this.addWidget("text", "tool ID", this.properties.toolId as string, "toolId");
    this.addWidget("text", "description", this.properties.toolDescription as string, "toolDescription");
    this.addWidget("toggle", "enable validation", this.properties.enableValidation as boolean, "enableValidation");
    this.addWidget("toggle", "enable logging", this.properties.enableLogging as boolean, "enableLogging");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}