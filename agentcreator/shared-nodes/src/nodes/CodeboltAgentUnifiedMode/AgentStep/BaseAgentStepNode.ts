import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Agent Step Node - Single LLM step execution
export class BaseAgentStepNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/step",
    title: "Agent Step",
    category: "unified/agent",
    description: "Execute a single agent step with LLM inference and processors",
    icon: "🔧",
    color: "#673AB7"
  };

  constructor() {
    super(BaseAgentStepNode.metadata.title, BaseAgentStepNode.metadata.type);
    this.title = BaseAgentStepNode.metadata.title;
    this.size = [260, 180];

    // Trigger input for step execution
    this.addInput("onExecute", LiteGraph.ACTION);

    // Input for original FlatUserMessage
    this.addInput("originalMessage", "object", {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "Original user message request"
      }
    } as any);

    // Input for processed message
    this.addInput("processedMessage", "object", {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Current processed message state"
      }
    } as any);

    // Input for pre-inference processors
    this.addInput("preInferenceProcessors", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.PRE_INFERENCE_PROCESSOR,
        description: "Processors to run before LLM inference"
      }
    } as any);

    // Input for post-inference processors
    this.addInput("postInferenceProcessors", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.POST_INFERENCE_PROCESSOR,
        description: "Processors to run after LLM inference"
      }
    } as any);

    // Event output for step completion
    this.addOutput("onComplete", LiteGraph.EVENT);

    // Event output for step error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for step result
    this.addOutput("result", "object", {
      extra_info: {
        dataType: DATA_TYPES.AGENT_STEP_OUTPUT,
        description: "Agent step execution result with LLM response"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Step configuration properties
    this.properties = {
      llmRole: "assistant",
      enableLogging: true
    };

    // Add widgets for configuration
    this.addWidget("text", "LLM role", this.properties.llmRole, "llmRole");
    this.addWidget("toggle", "enable logging", this.properties.enableLogging, "enableLogging");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}