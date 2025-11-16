import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for tool parameter modifier properties
interface ToolParameterModifierProperties {
  enableModification: boolean;
  modificationRules: string[];
  parameterDefaults: string[];
  sanitizationEnabled: boolean;
  sanitizationRules: string[];
  transformationEnabled: boolean;
  transformationRules: string[];
  validationEnabled: boolean;
  validationRules: string[];
}

// Base Tool Parameter Modifier Node - Transforms tool parameters before execution
export class BaseToolParameterModifierNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/preToolCall/toolParameterModifier",
    title: "Tool Parameter Modifier",
    category: "codebolt/agentProcessor/preToolCall",
    description: "Transforms tool parameters before execution with rules and validation",
    icon: "⚙️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseToolParameterModifierNode.metadata.title, BaseToolParameterModifierNode.metadata.type);
    this.title = BaseToolParameterModifierNode.metadata.title;
    this.size = [280, 340];

    // Input for the tool call object
    this.addInput("toolCall", "object", {
      extra_info: {
        dataType: "object",
        description: "Tool call with parameters to modify"
      }
    } as any);

    // Optional input for custom modification rules
    this.addInput("customRules", "object", {
      extra_info: {
        dataType: "object",
        description: "Custom parameter modification rules (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the modified tool call
    this.addOutput("modifiedToolCall", "object", {
      extra_info: {
        dataType: "object",
        description: "Tool call with modified parameters"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for modification configuration
    this.addOutput("modificationConfig", DATA_TYPES.TOOL_VALIDATION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.TOOL_VALIDATION_CONFIG,
        description: "Parameter modification configuration used"
      }
    } as any);

    // Output for modification log
    this.addOutput("modificationLog", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        description: "Log of parameter modifications applied"
      }
    } as any);

    // Output for final parameters
    this.addOutput("finalParameters", "object", {
      extra_info: {
        dataType: "object",
        description: "Final parameters after all modifications"
      }
    } as any);

    // Default properties
    this.properties = {
      enableModification: true,
      modificationRules: [],
      parameterDefaults: [],
      sanitizationEnabled: true,
      sanitizationRules: ['remove_html', 'escape_special_chars', 'normalize_whitespace'],
      transformationEnabled: true,
      transformationRules: [],
      validationEnabled: true,
      validationRules: []
    } as ToolParameterModifierProperties;

    // Configuration widgets
    this.addWidget("toggle", "Modification", true, "enableModification", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Modification Rules", "", "modificationRulesInput");

    this.addWidget("text", "Parameter Defaults", "", "parameterDefaultsInput");

    this.addWidget("toggle", "Sanitization", true, "sanitizationEnabled", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Sanitization Rules", "remove_html,escape_special_chars,normalize_whitespace", "sanitizationRulesInput");

    this.addWidget("toggle", "Transformation", true, "transformationEnabled", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Transformation Rules", "", "transformationRulesInput");

    this.addWidget("toggle", "Validation", true, "validationEnabled", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("text", "Validation Rules", "", "validationRulesInput");

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    switch (name) {
      case "modificationRulesInput":
        this.properties.modificationRules = (value as string).split(',').map(rule => rule.trim()).filter(rule => rule);
        break;
      case "parameterDefaultsInput":
        this.properties.parameterDefaults = (value as string).split(',').map(def => def.trim()).filter(def => def);
        break;
      case "sanitizationRulesInput":
        this.properties.sanitizationRules = (value as string).split(',').map(rule => rule.trim()).filter(rule => rule);
        break;
      case "transformationRulesInput":
        this.properties.transformationRules = (value as string).split(',').map(rule => rule.trim()).filter(rule => rule);
        break;
      case "validationRulesInput":
        this.properties.validationRules = (value as string).split(',').map(rule => rule.trim()).filter(rule => rule);
        break;
    }
    return true;
  }

  // Get the configuration for the tool parameter modifier
  getToolParameterModifierConfig(): ToolParameterModifierProperties {
    return {
      enableModification: this.properties.enableModification as boolean,
      modificationRules: this.properties.modificationRules as string[],
      parameterDefaults: this.properties.parameterDefaults as string[],
      sanitizationEnabled: this.properties.sanitizationEnabled as boolean,
      sanitizationRules: this.properties.sanitizationRules as string[],
      transformationEnabled: this.properties.transformationEnabled as boolean,
      transformationRules: this.properties.transformationRules as string[],
      validationEnabled: this.properties.validationEnabled as boolean,
      validationRules: this.properties.validationRules as string[]
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}