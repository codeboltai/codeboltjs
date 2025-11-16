import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for tool validation properties
interface ToolValidationProperties {
  enableValidation: boolean;
  strictValidation: boolean;
  validateParameters: boolean;
  validatePermissions: boolean;
  validateSchema: boolean;
  allowedToolTypes: string[];
  blockedToolTypes: string[];
  maxParameterCount: number;
  enableParameterSanitization: boolean;
}

// Base Tool Validation Node - Validates tool parameters and schemas
export class BaseToolValidationNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/preToolCall/toolValidation",
    title: "Tool Validation",
    category: "codebolt/agentProcessor/preToolCall",
    description: "Validates tool parameters, schemas, and permissions before execution",
    icon: "✅",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseToolValidationNode.metadata.title, BaseToolValidationNode.metadata.type);
    this.title = BaseToolValidationNode.metadata.title;
    this.size = [280, 320];

    // Input for the tool call object
    this.addInput("toolCall", "object", {
      extra_info: {
        dataType: "object",
        description: "Tool call to validate"
      }
    } as any);

    // Optional input for custom validation rules
    this.addInput("validationRules", "object", {
      extra_info: {
        dataType: "object",
        description: "Custom validation rules (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the validated tool call
    this.addOutput("validatedToolCall", "object", {
      extra_info: {
        dataType: "object",
        description: "Validated tool call object"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for validation configuration
    this.addOutput("validationConfig", DATA_TYPES.TOOL_VALIDATION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.TOOL_VALIDATION_CONFIG,
        description: "Tool validation configuration used"
      }
    } as any);

    // Output for validation results
    this.addOutput("validationResults", "object", {
      extra_info: {
        dataType: "object",
        description: "Detailed validation results and any issues found"
      }
    } as any);

    // Output for validation errors
    this.addOutput("validationErrors", "array", {
      extra_info: {
        dataType: "array",
        elementType: "string",
        description: "List of validation errors (empty if valid)"
      }
    } as any);

    // Default properties
    this.properties = {
      enableValidation: true,
      strictValidation: false,
      validateParameters: true,
      validatePermissions: true,
      validateSchema: true,
      allowedToolTypes: [],
      blockedToolTypes: ['shell', 'exec', 'eval', 'system'],
      maxParameterCount: 20,
      enableParameterSanitization: true
    } as ToolValidationProperties;

    // Configuration widgets
    this.addWidget("toggle", "Validation", true, "enableValidation", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Strict Mode", false, "strictValidation", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Validate Parameters", true, "validateParameters", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Validate Permissions", true, "validatePermissions", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("toggle", "Validate Schema", true, "validateSchema", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Blocked Tools", "shell,exec,eval,system", "blockedToolTypesInput");

    this.addWidget("number", "Max Parameters", 20, "maxParameterCount", {
      min: 5,
      max: 100,
      step: 1
    });

    this.addWidget("toggle", "Parameter Sanitization", true, "enableParameterSanitization", {
      on: "Enabled",
      off: "Disabled"
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "blockedToolTypesInput") {
      this.properties.blockedToolTypes = (value as string).split(',').map(type => type.trim()).filter(type => type);
    }
    return true;
  }

  // Get the configuration for the tool validation
  getToolValidationConfig(): ToolValidationProperties {
    return {
      enableValidation: this.properties.enableValidation as boolean,
      strictValidation: this.properties.strictValidation as boolean,
      validateParameters: this.properties.validateParameters as boolean,
      validatePermissions: this.properties.validatePermissions as boolean,
      validateSchema: this.properties.validateSchema as boolean,
      allowedToolTypes: this.properties.allowedToolTypes as string[],
      blockedToolTypes: this.properties.blockedToolTypes as string[],
      maxParameterCount: this.properties.maxParameterCount as number,
      enableParameterSanitization: this.properties.enableParameterSanitization as boolean
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}