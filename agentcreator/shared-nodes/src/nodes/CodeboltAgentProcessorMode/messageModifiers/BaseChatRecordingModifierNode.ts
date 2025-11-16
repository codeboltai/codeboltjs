import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for chat recording modifier properties
interface ChatRecordingModifierProperties {
  enableRecording: boolean;
  recordingPath: string;
  maxRecordingSize: number;
  includeMetadata: boolean;
  recordingFormat: 'jsonl' | 'markdown' | 'json';
  autoRotateFiles: boolean;
  compressionEnabled: boolean;
}

// Base Chat Recording Modifier Node - Records conversations to files
export class BaseChatRecordingModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/chatRecording",
    title: "Chat Recording",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Records conversations to files for persistence",
    icon: "📝",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseChatRecordingModifierNode.metadata.title, BaseChatRecordingModifierNode.metadata.type);
    this.title = BaseChatRecordingModifierNode.metadata.title;
    this.size = [280, 340];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to record"
      }
    } as any);

    // Optional input for custom recording path
    this.addInput("customPath", "string", {
      extra_info: {
        dataType: "string",
        description: "Custom recording path (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the message (unchanged)
    this.addOutput("message", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Original message (recording is transparent)"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for recording path
    this.addOutput("recordingPath", "string", {
      extra_info: {
        dataType: "string",
        description: "Path where the message was recorded"
      }
    } as any);

    // Output for recording configuration
    this.addOutput("recordingConfig", DATA_TYPES.RECORDING_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.RECORDING_CONFIG,
        description: "Recording configuration that was used"
      }
    } as any);

    // Default properties
    this.properties = {
      enableRecording: true,
      recordingPath: "./chat-records",
      maxRecordingSize: 100 * 1024 * 1024, // 100MB
      includeMetadata: true,
      recordingFormat: 'jsonl' as const,
      autoRotateFiles: false,
      compressionEnabled: false
    } as ChatRecordingModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Recording", true, "enableRecording", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Recording Path", "./chat-records", "recordingPath");

    this.addWidget("number", "Max Size (MB)", 100, "maxRecordingSize", {
      min: 1,
      max: 1000,
      step: 1
    });

    this.addWidget("toggle", "Include Metadata", true, "includeMetadata", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Recording Format", "jsonl", "recordingFormat", {
      values: ["jsonl", "markdown", "json"]
    });

    this.addWidget("toggle", "Auto Rotate", false, "autoRotateFiles", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Compression", false, "compressionEnabled", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the chat recording modifier
  getChatRecordingConfig(): ChatRecordingModifierProperties {
    return {
      enableRecording: this.properties.enableRecording as boolean,
      recordingPath: this.properties.recordingPath as string,
      maxRecordingSize: (this.properties.maxRecordingSize as number) * 1024 * 1024, // Convert MB to bytes
      includeMetadata: this.properties.includeMetadata as boolean,
      recordingFormat: this.properties.recordingFormat as 'jsonl' | 'markdown' | 'json',
      autoRotateFiles: this.properties.autoRotateFiles as boolean,
      compressionEnabled: this.properties.compressionEnabled as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}