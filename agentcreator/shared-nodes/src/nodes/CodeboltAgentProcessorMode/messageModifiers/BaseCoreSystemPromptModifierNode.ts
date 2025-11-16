import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for core system prompt modifier properties
interface CoreSystemPromptModifierProperties {
  customSystemPrompt: string;
  userMemory: string;
  enableCustomPrompt: boolean;
  enableUserMemory: boolean;
}

// Base Core System Prompt Modifier Node - Adds system prompts to guide AI behavior
export class BaseCoreSystemPromptModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/coreSystemPrompt",
    title: "Core System Prompt",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Adds system prompts and user memory to guide AI behavior",
    icon: "🤖",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseCoreSystemPromptModifierNode.metadata.title, BaseCoreSystemPromptModifierNode.metadata.type);
    this.title = BaseCoreSystemPromptModifierNode.metadata.title;
    this.size = [280, 280];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with system prompt"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Enhanced message with system prompt"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for the system prompt that was added
    this.addOutput("systemPrompt", "string", {
      extra_info: {
        dataType: "string",
        description: "System prompt that was added to the conversation"
      }
    } as any);

    // Default properties
    this.properties = {
      customSystemPrompt: "",
      userMemory: "",
      enableCustomPrompt: false,
      enableUserMemory: false
    } as CoreSystemPromptModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Custom Prompt", false, "enableCustomPrompt", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Custom System Prompt", "", "customSystemPrompt", {
      multiline: true,
      rows: 4
    });

    this.addWidget("toggle", "User Memory", false, "enableUserMemory", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "User Memory", "", "userMemory", {
      multiline: true,
      rows: 3
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    // Update node size based on widget states
    if (name === "enableCustomPrompt" || name === "enableUserMemory") {
      const hasCustomPrompt = this.properties.enableCustomPrompt as boolean;
      const hasUserMemory = this.properties.enableUserMemory as boolean;

      if (hasCustomPrompt && hasUserMemory) {
        this.size = [280, 280];
      } else if (hasCustomPrompt || hasUserMemory) {
        this.size = [280, 220];
      } else {
        this.size = [280, 160];
      }
    }
    return true;
  }

  // Get the configuration for the core system prompt modifier
  getCoreSystemPromptConfig(): CoreSystemPromptModifierProperties {
    return {
      customSystemPrompt: this.properties.customSystemPrompt as string,
      userMemory: this.properties.userMemory as string,
      enableCustomPrompt: this.properties.enableCustomPrompt as boolean,
      enableUserMemory: this.properties.enableUserMemory as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}