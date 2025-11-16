import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for follow-up conversation properties
interface FollowUpConversationProperties {
  enableFollowUp: boolean;
  followUpStrategy: 'auto' | 'conditional' | 'manual';
  triggerKeywords: string[];
  maxFollowUps: number;
  followUpDelay: number;
  includeContext: boolean;
  contextWindow: number;
  personalizationLevel: 'low' | 'medium' | 'high';
}

// Base Follow Up Conversation Node - Handles follow-up conversations after tool calls
export class BaseFollowUpConversationNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/postToolCall/followUpConversation",
    title: "Follow Up Conversation",
    category: "codebolt/agentProcessor/postToolCall",
    description: "Handles follow-up conversations and context maintenance after tool calls",
    icon: "💭",
    color: "#F44336"
  };

  constructor() {
    super(BaseFollowUpConversationNode.metadata.title, BaseFollowUpConversationNode.metadata.type);
    this.title = BaseFollowUpConversationNode.metadata.title;
    this.size = [280, 340];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to analyze for follow-up opportunities"
      }
    } as any);

    // Optional input for tool results
    this.addInput("toolResults", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.TOOL_RESULT,
        description: "Tool results to analyze for follow-up (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the processed message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with follow-up analysis applied"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for follow-up configuration
    this.addOutput("followUpConfig", DATA_TYPES.CONVERSATION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.CONVERSATION_CONFIG,
        description: "Follow-up conversation configuration used"
      }
    } as any);

    // Output for follow-up triggers
    this.addOutput("followUpTriggers", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        description: "Detected follow-up triggers and suggestions"
      }
    } as any);

    // Output for suggested questions
    this.addOutput("suggestedQuestions", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        description: "Suggested follow-up questions based on context"
      }
    } as any);

    // Default properties
    this.properties = {
      enableFollowUp: true,
      followUpStrategy: 'auto' as const,
      triggerKeywords: ['how', 'what', 'why', 'when', 'where', 'explain', 'tell me more', 'can you', 'could you'],
      maxFollowUps: 3,
      followUpDelay: 2,
      includeContext: true,
      contextWindow: 10,
      personalizationLevel: 'medium' as const
    } as FollowUpConversationProperties;

    // Configuration widgets
    this.addWidget("toggle", "Follow Up", true, "enableFollowUp", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Strategy", "auto", "followUpStrategy", {
      values: ["auto", "conditional", "manual"]
    });

    this.addWidget("text", "Trigger Keywords", "how,what,why,when,where,explain,tell me more,can you,could you", "triggerKeywordsInput");

    this.addWidget("number", "Max Follow Ups", 3, "maxFollowUps", {
      min: 1,
      max: 10,
      step: 1
    });

    this.addWidget("number", "Delay (sec)", 2, "followUpDelay", {
      min: 0,
      max: 30,
      step: 1
    });

    this.addWidget("toggle", "Include Context", true, "includeContext", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Context Window", 10, "contextWindow", {
      min: 5,
      max: 50,
      step: 1
    });

    this.addWidget("combo", "Personalization", "medium", "personalizationLevel", {
      values: ["low", "medium", "high"]
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "triggerKeywordsInput") {
      this.properties.triggerKeywords = (value as string).split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
    }
    return true;
  }

  // Get the configuration for the follow-up conversation
  getFollowUpConversationConfig(): FollowUpConversationProperties {
    return {
      enableFollowUp: this.properties.enableFollowUp as boolean,
      followUpStrategy: this.properties.followUpStrategy as 'auto' | 'conditional' | 'manual',
      triggerKeywords: this.properties.triggerKeywords as string[],
      maxFollowUps: this.properties.maxFollowUps as number,
      followUpDelay: this.properties.followUpDelay as number,
      includeContext: this.properties.includeContext as boolean,
      contextWindow: this.properties.contextWindow as number,
      personalizationLevel: this.properties.personalizationLevel as 'low' | 'medium' | 'high'
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}