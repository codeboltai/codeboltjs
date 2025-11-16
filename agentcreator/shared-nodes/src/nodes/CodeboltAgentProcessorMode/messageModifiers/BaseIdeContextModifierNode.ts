import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for IDE context modifier properties
interface IdeContextModifierProperties {
  includeOpenFiles: boolean;
  includeActiveFile: boolean;
  includeCursorPosition: boolean;
  includeSelectedText: boolean;
  maxOpenFiles: number;
}

// Base IDE Context Modifier Node - Integrates IDE/editor context
export class BaseIdeContextModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/ideContext",
    title: "IDE Context",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Integrates IDE context including open files, cursor position, and selected text",
    icon: "💻",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseIdeContextModifierNode.metadata.title, BaseIdeContextModifierNode.metadata.type);
    this.title = BaseIdeContextModifierNode.metadata.title;
    this.size = [280, 260];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with IDE context"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Enhanced message with IDE context"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for IDE context data
    this.addOutput("ideContext", DATA_TYPES.IDE_CONTEXT, {
      extra_info: {
        dataType: DATA_TYPES.IDE_CONTEXT,
        description: "IDE context data that was added"
      }
    } as any);

    // Output for open files list
    this.addOutput("openFiles", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: ARRAY_TYPES.FILE_LIST,
        description: "List of open files that were included"
      }
    } as any);

    // Default properties
    this.properties = {
      includeOpenFiles: true,
      includeActiveFile: true,
      includeCursorPosition: true,
      includeSelectedText: true,
      maxOpenFiles: 10
    } as IdeContextModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Open Files", true, "includeOpenFiles", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Active File", true, "includeActiveFile", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Cursor Position", true, "includeCursorPosition", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Selected Text", true, "includeSelectedText", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Open Files", 10, "maxOpenFiles", {
      min: 1,
      max: 50,
      step: 1
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Get the configuration for the IDE context modifier
  getIdeContextConfig(): IdeContextModifierProperties {
    return {
      includeOpenFiles: this.properties.includeOpenFiles as boolean,
      includeActiveFile: this.properties.includeActiveFile as boolean,
      includeCursorPosition: this.properties.includeCursorPosition as boolean,
      includeSelectedText: this.properties.includeSelectedText as boolean,
      maxOpenFiles: this.properties.maxOpenFiles as number
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}