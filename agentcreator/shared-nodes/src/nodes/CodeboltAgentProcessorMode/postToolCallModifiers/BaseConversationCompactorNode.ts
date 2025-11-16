import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for conversation compactor properties
interface ConversationCompactorProperties {
  enableCompaction: boolean;
  compactionStrategy: 'recent' | 'important' | 'summarize' | 'hybrid';
  maxConversationLength: number;
  preserveToolCalls: boolean;
  preserveErrors: boolean;
  summaryStyle: 'brief' | 'detailed' | 'bullet';
  compressionRatio: number;
}

// Base Conversation Compactor Node - Compacts conversation after tool calls
export class BaseConversationCompactorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/postToolCall/conversationCompactor",
    title: "Conversation Compactor",
    category: "codebolt/agentProcessor/postToolCall",
    description: "Compacts conversation after tool calls to maintain context",
    icon: "📦",
    color: "#F44336"
  };

  constructor() {
    super(BaseConversationCompactorNode.metadata.title, BaseConversationCompactorNode.metadata.type);
    this.title = BaseConversationCompactorNode.metadata.title;
    this.size = [280, 320];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to compact conversation for"
      }
    } as any);

    // Optional input for conversation history
    this.addInput("conversationHistory", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.CHAT_ENTRY,
        description: "Conversation history to compact (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the compacted message
    this.addOutput("compactedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with compacted conversation"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for compaction configuration
    this.addOutput("compactionConfig", DATA_TYPES.CONVERSATION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.CONVERSATION_CONFIG,
        description: "Conversation compaction configuration used"
      }
    } as any);

    // Output for compaction statistics
    this.addOutput("compactionStats", "object", {
      extra_info: {
        dataType: "object",
        description: "Statistics about conversation compaction"
      }
    } as any);

    // Output for compacted conversation
    this.addOutput("compactedConversation", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.CHAT_ENTRY,
        description: "Compacted conversation entries"
      }
    } as any);

    // Default properties
    this.properties = {
      enableCompaction: true,
      compactionStrategy: 'hybrid' as const,
      maxConversationLength: 50,
      preserveToolCalls: true,
      preserveErrors: true,
      summaryStyle: 'brief' as const,
      compressionRatio: 0.4
    } as ConversationCompactorProperties;

    // Configuration widgets
    this.addWidget("toggle", "Compaction", true, "enableCompaction", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Strategy", "hybrid", "compactionStrategy", {
      values: ["recent", "important", "summarize", "hybrid"]
    });

    this.addWidget("number", "Max Length", 50, "maxConversationLength", {
      min: 10,
      max: 200,
      step: 5
    });

    this.addWidget("toggle", "Preserve Tool Calls", true, "preserveToolCalls", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Preserve Errors", true, "preserveErrors", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Summary Style", "brief", "summaryStyle", {
      values: ["brief", "detailed", "bullet"]
    });

    this.addWidget("number", "Compression", 0.4, "compressionRatio", {
      min: 0.1,
      max: 0.8,
      step: 0.1
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the conversation compactor
  getConversationCompactorConfig(): ConversationCompactorProperties {
    return {
      enableCompaction: this.properties.enableCompaction as boolean,
      compactionStrategy: this.properties.compactionStrategy as 'recent' | 'important' | 'summarize' | 'hybrid',
      maxConversationLength: this.properties.maxConversationLength as number,
      preserveToolCalls: this.properties.preserveToolCalls as boolean,
      preserveErrors: this.properties.preserveErrors as boolean,
      summaryStyle: this.properties.summaryStyle as 'brief' | 'detailed' | 'bullet',
      compressionRatio: this.properties.compressionRatio as number
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}