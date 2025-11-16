import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for chat compression modifier properties
interface ChatCompressionModifierProperties {
  tokenThreshold: number;
  compressionRatio: number;
  preserveRecentMessages: number;
  compressionStrategy: 'simple' | 'semantic' | 'hybrid';
  includeSystemMessages: boolean;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Chat Compression Modifier Node - Compresses chat history when exceeding token limits
export class BaseChatCompressionModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/postInference/chatCompression",
    title: "Chat Compression",
    category: "codebolt/agentProcessor/postInference",
    description: "Compresses chat history when exceeding token limits (70% threshold, preserves 30% recent)",
    icon: "🗜️",
    color: "#FF9800"
  };

  constructor() {
    super(BaseChatCompressionModifierNode.metadata.title, BaseChatCompressionModifierNode.metadata.type);
    this.title = BaseChatCompressionModifierNode.metadata.title;
    this.size = [280, 260];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to compress if needed"
      }
    } as any);

    // Optional input for custom compression threshold
    this.addInput("customThreshold", "number", {
      extra_info: {
        dataType: "number",
        description: "Custom token threshold (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the compressed message
    this.addOutput("compressedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with compressed chat history"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for compression statistics
    this.addOutput("compressionStats", DATA_TYPES.COMPRESSION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.COMPRESSION_CONFIG,
        description: "Compression statistics and configuration"
      }
    } as any);

    // Output for original/compressed message comparison
    this.addOutput("compressionRatio", "number", {
      extra_info: {
        dataType: "number",
        description: "Compression ratio achieved (0.0-1.0)"
      }
    } as any);

    // Default properties
    this.properties = {
      tokenThreshold: 4096, // 70% of typical 6K limit
      compressionRatio: 0.3, // Preserve 30% of content
      preserveRecentMessages: 5,
      compressionStrategy: 'hybrid' as const,
      includeSystemMessages: false
    } as ChatCompressionModifierProperties;

    // Configuration widgets
    this.addWidget("number", "Token Threshold", 4096, "tokenThreshold", {
      min: 1000,
      max: 16000,
      step: 100
    });

    this.addWidget("number", "Compression Ratio", 0.3, "compressionRatio", {
      min: 0.1,
      max: 0.8,
      step: 0.05
    });

    this.addWidget("number", "Preserve Recent", 5, "preserveRecentMessages", {
      min: 1,
      max: 20,
      step: 1
    });

    this.addWidget("combo", "Strategy", "hybrid", "compressionStrategy", {
      values: ["simple", "semantic", "hybrid"]
    });

    this.addWidget("toggle", "Include System", false, "includeSystemMessages", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the chat compression modifier
  getChatCompressionConfig(): ChatCompressionModifierProperties {
    const customThreshold = this.getInputData(1) as number;
    return {
      tokenThreshold: customThreshold || (this.properties.tokenThreshold as number),
      compressionRatio: this.properties.compressionRatio as number,
      preserveRecentMessages: this.properties.preserveRecentMessages as number,
      compressionStrategy: this.properties.compressionStrategy as 'simple' | 'semantic' | 'hybrid',
      includeSystemMessages: this.properties.includeSystemMessages as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}