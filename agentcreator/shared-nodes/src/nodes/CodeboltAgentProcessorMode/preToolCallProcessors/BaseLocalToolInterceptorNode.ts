import { LGraphNode, LiteGraph } from '@codebolt/litegraph';
import { DATA_TYPES, ARRAY_TYPES, ExtraInfo } from '../../../types/DataTypes';
import { NodeMetadata } from '../../../types';

// Interface for local tool interceptor properties
interface LocalToolInterceptorProperties {
  enableInterception: boolean;
  interceptionMode: 'allow' | 'block' | 'redirect' | 'modify';
  localToolDefinitions: string[];
  interceptionRules: string[];
  enableCaching: boolean;
  cacheTimeout: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  [key: string]: any; // Index signature to satisfy Dictionary<NodeProperty>
}

// Base Local Tool Interceptor Node - Intercepts local tools with custom handlers
export class BaseLocalToolInterceptorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "codebolt/agentProcessor/preToolCall/localToolInterceptor",
    title: "Local Tool Interceptor",
    category: "codebolt/agentProcessor/preToolCall",
    description: "Intercepts local tools with custom handlers and routing",
    icon: "🛡️",
    color: "#9C27B0"
  };

  constructor() {
    super(BaseLocalToolInterceptorNode.metadata.title, BaseLocalToolInterceptorNode.metadata.type);
    this.title = BaseLocalToolInterceptorNode.metadata.title;
    this.size = [280, 320];

    // Input for the tool call object
    this.addInput("toolCall", "object", {
      extra_info: {
        dataType: "object",
        description: "Tool call to intercept"
      }
    } as any);

    // Optional input for custom handlers
    this.addInput("customHandlers", "object", {
      extra_info: {
        dataType: "object",
        description: "Custom tool handlers (optional)"
      }
    } as any);

    // Trigger input for processing
    this.addInput("onTrigger", LiteGraph.ACTION);

    // Output for the intercepted tool call
    this.addOutput("interceptedToolCall", "object", {
      extra_info: {
        dataType: "object",
        description: "Intercepted and processed tool call"
      }
    } as any);

    // Output for success status
    this.addOutput("success", "boolean");

    // Output for interception configuration
    this.addOutput("interceptionConfig", DATA_TYPES.TOOL_VALIDATION_CONFIG, {
      extra_info: {
        dataType: DATA_TYPES.TOOL_VALIDATION_CONFIG,
        description: "Tool interception configuration used"
      }
    } as any);

    // Output for interception actions
    this.addOutput("interceptionActions", "array", {
      extra_info: {
        dataType: "array",
        elementType: "object",
        description: "Actions taken during interception"
      }
    } as any);

    // Output for modified parameters
    this.addOutput("modifiedParameters", "object", {
      extra_info: {
        dataType: "object",
        description: "Modified tool parameters after interception"
      }
    } as any);

    // Default properties
    this.properties = {
      enableInterception: true,
      interceptionMode: 'allow' as const,
      localToolDefinitions: [],
      interceptionRules: [],
      enableCaching: true,
      cacheTimeout: 300, // 5 minutes
      enableLogging: true,
      logLevel: 'info' as const
    } as LocalToolInterceptorProperties;

    // Configuration widgets
    this.addWidget("toggle", "Interception", true, "enableInterception", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Mode", "allow", "interceptionMode", {
      values: ["allow", "block", "redirect", "modify"]
    });

    this.addWidget("text", "Local Tools", "", "localToolDefinitionsInput");

    this.addWidget("text", "Interception Rules", "", "interceptionRulesInput");

    this.addWidget("toggle", "Enable Caching", true, "enableCaching", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("number", "Cache Timeout", 300, "cacheTimeout", {
      min: 60,
      max: 3600,
      step: 30
    });

    this.addWidget("toggle", "Enable Logging", true, "enableLogging", {
      on: "Enabled",
      off: "Disabled"
    });

    this.addWidget("combo", "Log Level", "info", "logLevel", {
      values: ["debug", "info", "warn", "error"]
    });

    // Enable ON_TRIGGER mode so onExecute only runs when triggered
    this.mode = LiteGraph.ON_TRIGGER;
  }

  // Handle property changes
  onPropertyChanged(name: string, value: unknown, prev_value?: unknown): boolean {
    if (name === "localToolDefinitionsInput") {
      this.properties.localToolDefinitions = (value as string).split(',').map(tool => tool.trim()).filter(tool => tool);
    } else if (name === "interceptionRulesInput") {
      this.properties.interceptionRules = (value as string).split(',').map(rule => rule.trim()).filter(rule => rule);
    }
    return true;
  }

  // Get the configuration for the local tool interceptor
  getLocalToolInterceptorConfig(): LocalToolInterceptorProperties {
    return {
      enableInterception: this.properties.enableInterception as boolean,
      interceptionMode: this.properties.interceptionMode as 'allow' | 'block' | 'redirect' | 'modify',
      localToolDefinitions: this.properties.localToolDefinitions as string[],
      interceptionRules: this.properties.interceptionRules as string[],
      enableCaching: this.properties.enableCaching as boolean,
      cacheTimeout: this.properties.cacheTimeout as number,
      enableLogging: this.properties.enableLogging as boolean,
      logLevel: this.properties.logLevel as 'debug' | 'info' | 'warn' | 'error'
    };
  }

  // Enable ON_TRIGGER mode so onExecute only runs when triggered
  mode = LiteGraph.ON_TRIGGER;
}