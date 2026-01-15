import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for conversation continuity properties
interface ConversationContinuityProperties {
  enableContinuity: boolean;
  continuityMode: 'context' | 'reference' | 'temporal' | 'semantic';
  preserveMemory: boolean;
  memoryKeyExtraction: boolean;
  crossToolContext: boolean;
  maxMemoryItems: number;
  contextDecay: number;
  enableLearning: boolean;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Conversation Continuity Node - Maintains context across tool calls
export class BaseConversationContinuityNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/postToolCall/conversationContinuity",
    title: "Conversation Continuity",
    category: "codebolt/agentProcessor/postToolCall",
    description: "Maintains cross-tool call context and conversation continuity",
    icon: "🔗",
    color: "#F44336"
  };

  constructor() {
    super(BaseConversationContinuityNode.metadata.title, BaseConversationContinuityNode.metadata.type);
    this.title = BaseConversationContinuityNode.metadata.title;
    this.size = [280, 340];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to maintain continuity for"
      }
    } as any);

    // Optional input for previous context
    this.addInput("previousContext", "object", {
      extra_info: {
        dataType: "object",
        description: "Previous conversation context (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the processed message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with continuity context maintained"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for continuity configuration
    this.addOutput("continuityConfig", DATA_TYPES.CONVERSATION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.CONVERSATION_CONFIG,
        description: "Conversation continuity configuration used"
      }
    } as any);

    // Output for extracted memory
    this.addOutput("extractedMemory", "object", {
      extra_info: {
        dataType: "object",
        description: "Memory items extracted for continuity"
      }
    } as any);

    // Output for context links
    this.addOutput("contextLinks", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        description: "Links between related conversation elements"
      }
    } as any);

    // Default properties
    this.properties = {
      enableContinuity: true,
      continuityMode: 'semantic' as const,
      preserveMemory: true,
      memoryKeyExtraction: true,
      crossToolContext: true,
      maxMemoryItems: 50,
      contextDecay: 0.1,
      enableLearning: false
    } as ConversationContinuityProperties;

    // Configuration widgets
    this.addWidget("toggle", "Continuity", true, "enableContinuity", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Mode", "semantic", "continuityMode", {
      values: ["context", "reference", "temporal", "semantic"]
    });

    this.addWidget("toggle", "Preserve Memory", true, "preserveMemory", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Key Extraction", true, "memoryKeyExtraction", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Cross-Tool Context", true, "crossToolContext", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Memory Items", 50, "maxMemoryItems", {
      min: 10,
      max: 200,
      step: 10
    });

    this.addWidget("number", "Context Decay", 0.1, "contextDecay", {
      min: 0.01,
      max: 1.0,
      step: 0.01
    });

    this.addWidget("toggle", "Enable Learning", false, "enableLearning", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the conversation continuity
  getConversationContinuityConfig(): ConversationContinuityProperties {
    return {
      enableContinuity: this.properties.enableContinuity as boolean,
      continuityMode: this.properties.continuityMode as 'context' | 'reference' | 'temporal' | 'semantic',
      preserveMemory: this.properties.preserveMemory as boolean,
      memoryKeyExtraction: this.properties.memoryKeyExtraction as boolean,
      crossToolContext: this.properties.crossToolContext as boolean,
      maxMemoryItems: this.properties.maxMemoryItems as number,
      contextDecay: this.properties.contextDecay as number,
      enableLearning: this.properties.enableLearning as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}