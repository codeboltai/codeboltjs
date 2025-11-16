import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for chat history message modifier properties
interface ChatHistoryMessageModifierProperties {
  enableChatHistory: boolean;
  maxHistoryMessages: number;
  includeSystemMessages: boolean;
  threadId: string;
  historyWindow: 'all' | 'last' | 'smart';
  includeTimestamps: boolean;
  compressHistory: boolean;
}

// Base Chat History Message Modifier Node - Adds previous conversation history
export class BaseChatHistoryMessageModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/chatHistory",
    title: "Chat History",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Retrieves and injects previous conversation history",
    icon: "💬",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseChatHistoryMessageModifierNode.metadata.title, BaseChatHistoryMessageModifierNode.metadata.type);
    this.title = BaseChatHistoryMessageModifierNode.metadata.title;
    this.size = [280, 300];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with chat history"
      }
    } as any);

    // Optional input for thread ID
    this.addInput("threadId", "string", {
      extra_info: {
        dataType: "string",
        description: "Thread ID for history retrieval (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message enhanced with chat history"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for chat history data
    this.addOutput("chatHistory", DATA_TYPES.CHAT_HISTORY, {
      extra_info: {
        dataType: DATA_TYPES.CHAT_HISTORY,
        description: "Chat history that was added to the message"
      }
    } as any);

    // Output for history entries
    this.addOutput("historyEntries", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.CHAT_ENTRY,
        description: "Individual chat history entries"
      }
    } as any);

    // Default properties
    this.properties = {
      enableChatHistory: true,
      maxHistoryMessages: 10,
      includeSystemMessages: false,
      threadId: "",
      historyWindow: 'smart' as const,
      includeTimestamps: false,
      compressHistory: false
    } as ChatHistoryMessageModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Chat History", true, "enableChatHistory", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Messages", 10, "maxHistoryMessages", {
      min: 1,
      max: 100,
      step: 1
    });

    this.addWidget("toggle", "System Messages", false, "includeSystemMessages", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Thread ID", "", "threadId");

    this.addWidget("combo", "History Window", "smart", "historyWindow", {
      values: ["all", "last", "smart"]
    });

    this.addWidget("toggle", "Timestamps", false, "includeTimestamps", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Compress History", false, "compressHistory", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    // Handle property changes if needed
    return true;
  }

  // Get the configuration for the chat history message modifier
  getChatHistoryConfig(): ChatHistoryMessageModifierProperties {
    return {
      enableChatHistory: this.properties.enableChatHistory as boolean,
      maxHistoryMessages: this.properties.maxHistoryMessages as number,
      includeSystemMessages: this.properties.includeSystemMessages as boolean,
      threadId: this.properties.threadId as string,
      historyWindow: this.properties.historyWindow as 'all' | 'last' | 'smart',
      includeTimestamps: this.properties.includeTimestamps as boolean,
      compressHistory: this.properties.compressHistory as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}