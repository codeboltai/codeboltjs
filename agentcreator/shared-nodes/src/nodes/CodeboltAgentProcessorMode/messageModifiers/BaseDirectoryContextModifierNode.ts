import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for directory context modifier properties
interface DirectoryContextModifierProperties {
  workspaceDirectories: string[];
  enableGitignore: boolean;
  maxDepth: number;
  includeHidden: boolean;
  showFileSizes: boolean;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Directory Context Modifier Node - Provides folder structure context for code projects
export class BaseDirectoryContextModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/directoryContext",
    title: "Directory Context",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Provides detailed folder structure with gitignore support",
    icon: "📁",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseDirectoryContextModifierNode.metadata.title, BaseDirectoryContextModifierNode.metadata.type);
    this.title = BaseDirectoryContextModifierNode.metadata.title;
    this.size = [280, 260];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to enhance with directory context"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Enhanced message with directory context"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for directory structure data
    this.addOutput("directoryStructure", DATA_TYPES.DIRECTORY_STRUCTURE, {
      extra_info: {
        dataType: DATA_TYPES.DIRECTORY_STRUCTURE,
        description: "Directory tree structure that was added"
      }
    } as any);

    // Output for directory list
    this.addOutput("directories", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: ARRAY_TYPES.DIRECTORY_LIST,
        description: "List of directories that were scanned"
      }
    } as any);

    // Default properties
    this.properties = {
      workspaceDirectories: [],
      enableGitignore: true,
      maxDepth: 3,
      includeHidden: false,
      showFileSizes: false
    } as DirectoryContextModifierProperties;

    // Configuration widgets
    this.addWidget("text", "Workspace Directories", "", "workspaceDirectoriesInput");
    this.addWidget("toggle", "Use Gitignore", true, "enableGitignore", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Depth", 3, "maxDepth", {
      min: 1,
      max: 10,
      step: 1
    });

    this.addWidget("toggle", "Include Hidden", false, "includeHidden", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Show File Sizes", false, "showFileSizes", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "workspaceDirectoriesInput") {
      this.properties.workspaceDirectories = (value as string).split(',').map(p => p.trim()).filter(p => p);
    }
    return true;
  }

  // Get the configuration for the directory context modifier
  getDirectoryContextConfig(): DirectoryContextModifierProperties {
    return {
      workspaceDirectories: this.properties.workspaceDirectories as string[],
      enableGitignore: this.properties.enableGitignore as boolean,
      maxDepth: this.properties.maxDepth as number,
      includeHidden: this.properties.includeHidden as boolean,
      showFileSizes: this.properties.showFileSizes as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}