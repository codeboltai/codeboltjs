import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for loop detection modifier properties
interface LoopDetectionModifierProperties {
  similarityThreshold: number;
  timeWindowMinutes: number;
  maxSimilarMessages: number;
  detectionMode: 'content' | 'semantic' | 'hybrid';
  enableAutoBreak: boolean;
  breakMessage: string;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Loop Detection Modifier Node - Detects conversational loops using similarity analysis
export class BaseLoopDetectionModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/postInference/loopDetection",
    title: "Loop Detection",
    category: "codebolt/agentProcessor/postInference",
    description: "Detects conversational loops using similarity analysis and time windows",
    icon: "🔄",
    color: "#FF9800"
  };

  constructor() {
    super(BaseLoopDetectionModifierNode.metadata.title, BaseLoopDetectionModifierNode.metadata.type);
    this.title = BaseLoopDetectionModifierNode.metadata.title;
    this.size = [280, 300];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to analyze for loops"
      }
    } as any);

    // Optional input for chat history
    this.addInput("chatHistory", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        description: "Chat history for loop analysis (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the processed message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with loop detection applied"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for loop detection results
    this.addOutput("loopDetected", DATA_TYPES.LOOP_DETECTION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.LOOP_DETECTION_CONFIG,
        description: "Loop detection results and configuration"
      }
    } as any);

    // Output for loop boolean indicator
    this.addOutput("isLoop", "boolean", {
      extra_info: {
        dataType: "boolean",
        description: "True if a loop was detected"
      }
    } as any);

    // Output for similarity score
    this.addOutput("similarityScore", "number", {
      extra_info: {
        dataType: "number",
        description: "Similarity score of detected loop (0.0-1.0)"
      }
    } as any);

    // Default properties
    this.properties = {
      similarityThreshold: 0.85,
      timeWindowMinutes: 10,
      maxSimilarMessages: 3,
      detectionMode: 'hybrid' as const,
      enableAutoBreak: true,
      breakMessage: "I notice we might be going in circles. Let me try a different approach to help you better."
    } as LoopDetectionModifierProperties;

    // Configuration widgets
    this.addWidget("number", "Similarity", 0.85, "similarityThreshold", {
      min: 0.5,
      max: 1.0,
      step: 0.05
    });

    this.addWidget("number", "Time Window", 10, "timeWindowMinutes", {
      min: 1,
      max: 60,
      step: 1
    });

    this.addWidget("number", "Max Similar", 3, "maxSimilarMessages", {
      min: 2,
      max: 10,
      step: 1
    });

    this.addWidget("combo", "Detection Mode", "hybrid", "detectionMode", {
      values: ["content", "semantic", "hybrid"]
    });

    this.addWidget("toggle", "Auto Break", true, "enableAutoBreak", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Break Message", "I notice we might be going in circles. Let me try a different approach to help you better.", "breakMessage", {
      multiline: true
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the loop detection modifier
  getLoopDetectionConfig(): LoopDetectionModifierProperties {
    return {
      similarityThreshold: this.properties.similarityThreshold as number,
      timeWindowMinutes: this.properties.timeWindowMinutes as number,
      maxSimilarMessages: this.properties.maxSimilarMessages as number,
      detectionMode: this.properties.detectionMode as 'content' | 'semantic' | 'hybrid',
      enableAutoBreak: this.properties.enableAutoBreak as boolean,
      breakMessage: this.properties.breakMessage as string
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}