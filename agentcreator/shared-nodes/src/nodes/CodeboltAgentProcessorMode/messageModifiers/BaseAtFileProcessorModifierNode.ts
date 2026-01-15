import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for @file processor modifier properties
interface AtFileProcessorModifierProperties {
  maxFileSize: number;
  allowedExtensions: string[];
  enableRecursiveSearch: boolean;
  basePath: string;
  includeLineNumbers: boolean;
  maxFileContent: number;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base @File Processor Modifier Node - Processes @file and @folder references
export class BaseAtFileProcessorModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/messageModifiers/atFileProcessor",
    title: "@File Processor",
    category: "codebolt/agentProcessor/messageModifiers",
    description: "Processes @file and @folder references with advanced capabilities",
    icon: "📄",
    color: "#4CAF50"
  };

  constructor() {
    super(BaseAtFileProcessorModifierNode.metadata.title, BaseAtFileProcessorModifierNode.metadata.type);
    this.title = BaseAtFileProcessorModifierNode.metadata.title;
    this.size = [280, 300];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to process for @file and @folder references"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the enhanced message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with @file and @folder references resolved"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for processed files
    this.addOutput("processedFiles", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.FILE_LIST,
        description: "Files that were processed and included"
      }
    } as any);

    // Output for file paths
    this.addOutput("filePaths", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        arrayType: ARRAY_TYPES.FILE_PATH,
        description: "Paths of files that were included"
      }
    } as any);

    // Default properties
    this.properties = {
      maxFileSize: 1024 * 1024, // 1MB
      allowedExtensions: ['ts', 'js', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt', 'scala', 'md', 'txt', 'json', 'yaml', 'yml', 'xml', 'html', 'css', 'scss', 'less', 'sql', 'sh', 'bat', 'ps1'],
      enableRecursiveSearch: true,
      basePath: "",
      includeLineNumbers: false,
      maxFileContent: 50 * 1024 // 50KB of content per file
    } as AtFileProcessorModifierProperties;

    // Configuration widgets
    this.addWidget("number", "Max File Size (MB)", 1, "maxFileSize", {
      min: 0.1,
      max: 10,
      step: 0.1
    });

    this.addWidget("text", "Allowed Extensions", "ts,js,jsx,tsx,py,java,cpp,c,h,cs,go,rs,php,rb,swift,kt,scala,md,txt,json,yaml,yml,xml,html,css,scss,less,sql,sh,bat,ps1", "allowedExtensionsInput");

    this.addWidget("toggle", "Recursive Search", true, "enableRecursiveSearch", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Base Path", "", "basePath");

    this.addWidget("toggle", "Line Numbers", false, "includeLineNumbers", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Content (KB)", 50, "maxFileContent", {
      min: 1,
      max: 500,
      step: 1
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

  // Get the configuration for the @file processor modifier
  getAtFileProcessorConfig(): AtFileProcessorModifierProperties {
    return {
      maxFileSize: (this.properties.maxFileSize as number) * 1024 * 1024, // Convert MB to bytes
      allowedExtensions: this.properties.allowedExtensions as string[],
      enableRecursiveSearch: this.properties.enableRecursiveSearch as boolean,
      basePath: this.properties.basePath as string,
      includeLineNumbers: this.properties.includeLineNumbers as boolean,
      maxFileContent: (this.properties.maxFileContent as number) * 1024 // Convert KB to bytes
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}