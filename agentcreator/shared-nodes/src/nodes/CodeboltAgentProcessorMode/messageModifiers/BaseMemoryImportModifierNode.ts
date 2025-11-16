import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for memory import modifier properties
interface MemoryImportModifierProperties {
  enableMemoryImport: boolean;
  maxFileSize: number;
  allowedExtensions: string[];
  basePath: string;
  maxImports: number;
  recursiveSearch: boolean;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Memory Import Modifier Node - Processes @file syntax to import file contents
export class BaseMemoryImportModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/memoryImport",
    title: "Memory Import",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Processes memory files using @path patterns and imports their content",
    icon: "🧠",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseMemoryImportModifierNode.metadata.title, BaseMemoryImportModifierNode.metadata.type);
    this.title = BaseMemoryImportModifierNode.metadata.title;
    this.size = [280, 280];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to process for memory import references"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with imported memory content"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for imported memory entries
    this.addOutput("importedMemories", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.MEMORY_ENTRY,
        description: "Memory entries that were imported"
      }
    } as any);

    // Output for memory file paths
    this.addOutput("memoryFiles", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: ARRAY_TYPES.FILE_PATH,
        description: "Paths of memory files that were imported"
      }
    } as any);

    // Default properties
    this.properties = {
      enableMemoryImport: true,
      maxFileSize: 512 * 1024, // 512KB
      allowedExtensions: ['md', 'txt', 'json', 'yaml', 'yml', 'log', 'csv', 'tsv', 'xml'],
      basePath: "",
      maxImports: 20,
      recursiveSearch: false
    } as MemoryImportModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Memory Import", true, "enableMemoryImport", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max File Size (KB)", 512, "maxFileSize", {
      min: 1,
      max: 2048,
      step: 1
    });

    this.addWidget("text", "Allowed Extensions", "md,txt,json,yaml,yml,log,csv,tsv,xml", "allowedExtensionsInput");

    this.addWidget("text", "Base Path", "", "basePath");

    this.addWidget("number", "Max Imports", 20, "maxImports", {
      min: 1,
      max: 100,
      step: 1
    });

    this.addWidget("toggle", "Recursive Search", false, "recursiveSearch", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "allowedExtensionsInput") {
      this.properties.allowedExtensions = (value as string).split(',').map(ext => ext.trim()).filter(ext => ext);
    }
    return true;
  }

  // Get the configuration for the memory import modifier
  getMemoryImportConfig(): MemoryImportModifierProperties {
    return {
      enableMemoryImport: this.properties.enableMemoryImport as boolean,
      maxFileSize: (this.properties.maxFileSize as number) * 1024, // Convert KB to bytes
      allowedExtensions: this.properties.allowedExtensions as string[],
      basePath: this.properties.basePath as string,
      maxImports: this.properties.maxImports as number,
      recursiveSearch: this.properties.recursiveSearch as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}