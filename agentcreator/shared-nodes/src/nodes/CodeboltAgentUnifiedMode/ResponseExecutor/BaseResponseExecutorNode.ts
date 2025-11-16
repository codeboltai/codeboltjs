import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Response Executor Node - Tool execution and response handling
export class BaseResponseExecutorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/responseexecutor",
    title: "Response Executor",
    category: "unified/agent",
    description: "Execute tools and process LLM responses with processors",
    icon: "⚡",
    color: "#2196F3"
  };

  constructor() {
    super(BaseResponseExecutorNode.metadata.title, BaseResponseExecutorNode.metadata.type);
    this.title = BaseResponseExecutorNode.metadata.title;
    this.size = [280, 200];

    // Trigger input for response execution
    this.addInput("onExecute", LiteGraph.ACTION);

    // Input for response data
    this.addInput("responseInput", "object", {
      extra_info: {
        dataType: DATA_TYPES.RESPONSE_INPUT,
        description: "Response input with LLM output and context"
      }
    } as any);

    // Input for pre-tool call processors
    this.addInput("preToolCallProcessors", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "preToolCallProcessor",
        description: "Processors to run before tool execution"
      }
    } as any);

    // Input for post-tool call processors
    this.addInput("postToolCallProcessors", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: "postToolCallProcessor",
        description: "Processors to run after tool execution"
      }
    } as any);

    // Event output for response completion
    this.addOutput("onComplete", LiteGraph.EVENT);

    // Event output for tool execution completion
    this.addOutput("onToolsComplete", LiteGraph.EVENT);

    // Event output for response error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for response result
    this.addOutput("result", "object", {
      extra_info: {
        dataType: DATA_TYPES.RESPONSE_OUTPUT,
        description: "Response execution result with tool results"
      }
    } as any);

    // Output for tool results array
    this.addOutput("toolResults", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.TOOL_RESULT,
        description: "Array of tool execution results"
      }
    } as any);

    // Output for completion status
    this.addOutput("completed", "boolean");

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Executor configuration properties
    this.properties = {
      enableLogging: true,
      continueOnToolError: true,
      maxToolRetries: 3
    };

    // Add widgets for configuration
    this.addWidget("toggle", "enable logging", this.properties.enableLogging, "enableLogging");
    this.addWidget("toggle", "continue on tool error", this.properties.continueOnToolError, "continueOnToolError");
    this.addWidget("number", "max tool retries", this.properties.maxToolRetries, "maxToolRetries", { min: 0, max: 10 });
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}