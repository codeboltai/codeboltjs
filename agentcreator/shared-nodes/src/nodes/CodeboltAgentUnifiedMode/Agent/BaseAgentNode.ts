import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Base Agent Node - Main unified agent execution
export class BaseAgentNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "unified/agent/execute",
    title: "Agent",
    category: "unified/agent",
    description: "Execute a unified agent with configuration and message processing",
    icon: "🤖",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseAgentNode.metadata.title, BaseAgentNode.metadata.type);
    this.title = BaseAgentNode.metadata.title;
    this.size = [280, 200];

    // Trigger input for agent execution
    this.addInput("onExecute", LiteGraph.ACTION);

    // Input for the FlatUserMessage
    this.addInput("message", "object", {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to process"
      }
    } as any);

    // Input for agent configuration
    this.addInput("agentConfig", "object", {
      extra_info: {
        dataType: DATA_TYPES.AGENT_CONFIG,
        description: "Agent configuration with processors and tools"
      }
    } as any);

    // Event output for agent execution completion
    this.addOutput("onComplete", LiteGraph.EVENT);

    // Event output for agent execution error
    this.addOutput("onError", LiteGraph.EVENT);

    // Output for execution result
    this.addOutput("result", "object", {
      extra_info: {
        dataType: DATA_TYPES.AGENT_EXECUTION_RESULT,
        description: "Complete agent execution result with conversation history and tool results"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for error message
    this.addOutput("error", "string");

    // Agent configuration properties
    this.properties = {
      agentName: "Agent",
      instructions: "You are a helpful assistant.",
      maxIterations: 10,
      maxConversationLength: 50,
      enableLogging: true
    };

    // Add widgets for configuration
    this.addWidget("text", "name", this.properties.agentName as string, "agentName");
    this.addWidget("text", "instructions", this.properties.instructions as string, "instructions");
    this.addWidget("number", "max iterations", this.properties.maxIterations as number, "maxIterations", { min: 1, max: 100 } as any);
    this.addWidget("number", "max conversation length", this.properties.maxConversationLength as number, "maxConversationLength", { min: 1, max: 1000 } as any);
    this.addWidget("toggle", "enable logging", this.properties.enableLogging as boolean, "enableLogging");
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}