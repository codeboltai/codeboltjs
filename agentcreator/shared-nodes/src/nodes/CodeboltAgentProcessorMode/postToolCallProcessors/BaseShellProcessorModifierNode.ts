import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for shell processor modifier properties
interface ShellProcessorModifierProperties {
  enableShellExecution: boolean;
  allowedCommands: string[];
  blockedCommands: string[];
  timeoutSeconds: number;
  workingDirectory: string;
  enableOutputCapture: boolean;
  maxOutputLength: number;
  allowFileModification: boolean;
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Shell Processor Modifier Node - Executes shell commands with security controls
export class BaseShellProcessorModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/postToolCall/shellProcessor",
    title: "Shell Processor",
    category: "codebolt/agentProcessor/postToolCall",
    description: "Executes shell commands with security controls and processes {command} injections",
    icon: "🖥️",
    color: "#F44336"
  };

  constructor() {
    super(BaseShellProcessorModifierNode.metadata.title, BaseShellProcessorModifierNode.metadata.type);
    this.title = BaseShellProcessorModifierNode.metadata.title;
    this.size = [280, 340];

    // Input for the FlatUserMessage object
    this.addInput("message", DATA_TYPES.FLAT_USER_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.FLAT_USER_MESSAGE,
        description: "User message to process for shell commands"
      }
    } as any);

    // Optional input for custom working directory
    this.addInput("workingDir", "string", {
      extra_info: {
        dataType: "string",
        description: "Custom working directory (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the processed message
    this.addOutput("processedMessage", DATA_TYPES.PROCESSED_MESSAGE, {
      extra_info: {
        dataType: DATA_TYPES.PROCESSED_MESSAGE,
        description: "Message with shell command execution results"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for shell configuration
    this.addOutput("shellConfig", DATA_TYPES.SHELL_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.SHELL_CONFIG,
        description: "Shell execution configuration used"
      }
    } as any);

    // Output for command results
    this.addOutput("commandResults", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        arrayType: ARRAY_TYPES.COMMAND_LIST,
        description: "Results of executed shell commands"
      }
    } as any);

    // Output for execution summary
    this.addOutput("executionSummary", "string", {
      extra_info: {
        dataType: "string",
        description: "Summary of shell command execution"
      }
    } as any);

    // Default properties
    this.properties = {
      enableShellExecution: true,
      allowedCommands: ['ls', 'pwd', 'cat', 'echo', 'grep', 'find', 'head', 'tail', 'wc', 'sort', 'uniq'],
      blockedCommands: ['rm', 'rmdir', 'mv', 'cp', 'chmod', 'chown', 'sudo', 'su', 'apt', 'yum', 'brew'],
      timeoutSeconds: 30,
      workingDirectory: "",
      enableOutputCapture: true,
      maxOutputLength: 10000,
      allowFileModification: false
    } as ShellProcessorModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Shell Execution", true, "enableShellExecution", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Allowed Commands", "ls,pwd,cat,echo,grep,find,head,tail,wc,sort,uniq", "allowedCommandsInput");

    this.addWidget("text", "Blocked Commands", "rm,rmdir,mv,cp,chmod,chown,sudo,su,apt,yum,brew", "blockedCommandsInput");

    this.addWidget("number", "Timeout (sec)", 30, "timeoutSeconds", {
      min: 5,
      max: 300,
      step: 5
    });

    this.addWidget("text", "Working Directory", "", "workingDirectory");

    this.addWidget("toggle", "Output Capture", true, "enableOutputCapture", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Max Output", 10000, "maxOutputLength", {
      min: 1000,
      max: 100000,
      step: 1000
    });

    this.addWidget("toggle", "File Modification", false, "allowFileModification", {
      on: "Allowed",
      off: "Blocked"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "allowedCommandsInput") {
      this.properties.allowedCommands = (value as string).split(',').map(cmd => cmd.trim()).filter(cmd => cmd);
    } else if (name === "blockedCommandsInput") {
      this.properties.blockedCommands = (value as string).split(',').map(cmd => cmd.trim()).filter(cmd => cmd);
    }
    return true;
  }

  // Get the configuration for the shell processor modifier
  getShellProcessorConfig(): ShellProcessorModifierProperties {
    const customWorkingDir = this.getInputData(1) as string;
    return {
      enableShellExecution: this.properties.enableShellExecution as boolean,
      allowedCommands: this.properties.allowedCommands as string[],
      blockedCommands: this.properties.blockedCommands as string[],
      timeoutSeconds: this.properties.timeoutSeconds as number,
      workingDirectory: customWorkingDir || (this.properties.workingDirectory as string),
      enableOutputCapture: this.properties.enableOutputCapture as boolean,
      maxOutputLength: this.properties.maxOutputLength as number,
      allowFileModification: this.properties.allowFileModification as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}