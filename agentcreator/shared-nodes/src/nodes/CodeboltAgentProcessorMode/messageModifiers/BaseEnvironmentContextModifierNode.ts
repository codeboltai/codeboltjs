import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for environment context modifier properties
interface EnvironmentContextModifierProperties {
  enableFullContext: boolean;
  maxFiles: number;
  maxFileSize: number;
  includePatterns: string[];
  excludePatterns: string[];
}

// Base Environment Context Modifier Node - Adds system environment and project context
export class BaseEnvironmentContextModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/environmentContext",
    title: "Environment Context",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Adds system environment and project context to messages",
    icon: "🌍",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseEnvironmentContextModifierNode.metadata.title, BaseEnvironmentContextModifierNode.metadata.type);
    this.title = BaseEnvironmentContextModifierNode.metadata.title;
    this.size = [280, 320];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with environment context"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Enhanced message with environment context"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for environment context data
    this.addOutput("environmentContext", DATA_TYPES.ENVIRONMENT_CONTEXT, {
      extra_info: {
        dataType: DATA_TYPES.ENVIRONMENT_CONTEXT,
        description: "Environment context data that was added"
      }
    } as any);

    // Default properties
    this.properties = {
      enableFullContext: false,
      maxFiles: 50,
      maxFileSize: 1024 * 1024, // 1MB
      includePatterns: [],
      excludePatterns: ["node_modules", ".git", "dist", "build"]
    } as EnvironmentContextModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Full Context", false, "enableFullContext", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Files", 50, "maxFiles", {
      min: 1,
      max: 1000,
      step: 1
    });

    this.addWidget("number", "Max File Size (MB)", 1, "maxFileSize", {
      min: 0.1,
      max: 10,
      step: 0.1
    });

    // Pattern inputs
    this.addWidget("text", "Include Patterns", "", "includePatternsInput");
    this.addWidget("text", "Exclude Patterns", "", "excludePatternsInput");

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "includePatternsInput") {
      this.properties.includePatterns = (value as string).split(',').map(p => p.trim()).filter(p => p);
    } else if (name === "excludePatternsInput") {
      this.properties.excludePatterns = (value as string).split(',').map(p => p.trim()).filter(p => p);
    }
    return true;
  }

  // Get the configuration for the environment context modifier
  getEnvironmentContextConfig(): EnvironmentContextModifierProperties {
    return {
      enableFullContext: this.properties.enableFullContext as boolean,
      maxFiles: this.properties.maxFiles as number,
      maxFileSize: this.properties.maxFileSize as number * 1024 * 1024, // Convert MB to bytes
      includePatterns: this.properties.includePatterns as string[],
      excludePatterns: this.properties.excludePatterns as string[]
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}