


/** Optional. The type of the data. */
export declare enum Type {
    /**
     * Not specified, should not be used.
     */
    TYPE_UNSPECIFIED = "TYPE_UNSPECIFIED",
    /**
     * OpenAPI string type
     */
    STRING = "STRING",
    /**
     * OpenAPI number type
     */
    NUMBER = "NUMBER",
    /**
     * OpenAPI integer type
     */
    INTEGER = "INTEGER",
    /**
     * OpenAPI boolean type
     */
    BOOLEAN = "BOOLEAN",
    /**
     * OpenAPI array type
     */
    ARRAY = "ARRAY",
    /**
     * OpenAPI object type
     */
    OBJECT = "OBJECT",
    /**
     * Null type
     */
    NULL = "NULL"
}

/** Defines the function behavior. Defaults to `BLOCKING`. */
export declare enum Behavior {
    /**
     * This value is unused.
     */
    UNSPECIFIED = "UNSPECIFIED",
    /**
     * If set, the system will wait to receive the function response before continuing the conversation.
     */
    BLOCKING = "BLOCKING",
    /**
     * If set, the system will not wait to receive the function response. Instead, it will attempt to handle function responses as they become available while maintaining the conversation between the user and the model.
     */
    NON_BLOCKING = "NON_BLOCKING"
}
export declare interface FunctionDeclaration {
    /** Defines the function behavior. */
    behavior?: Behavior;
    /** Optional. Description and purpose of the function. Model uses it to decide how and whether to call the function. */
    description?: string;
    /** Required. The name of the function to call. Must start with a letter or an underscore. Must be a-z, A-Z, 0-9, or contain underscores, dots and dashes, with a maximum length of 64. */
    name?: string;
    /** Optional. Describes the parameters to this function in JSON Schema Object format. Reflects the Open API 3.03 Parameter Object. string Key: the name of the parameter. Parameter names are case sensitive. Schema Value: the Schema defining the type used for the parameter. For function with no parameters, this can be left unset. Parameter names must start with a letter or an underscore and must only contain chars a-z, A-Z, 0-9, or underscores with a maximum length of 64. Example with 1 required and 1 optional parameter: type: OBJECT properties: param1: type: STRING param2: type: INTEGER required: - param1 */
    parameters?: Schema;
    /** Optional. Describes the parameters to the function in JSON Schema format. The schema must describe an object where the properties are the parameters to the function. For example: ``` { "type": "object", "properties": { "name": { "type": "string" }, "age": { "type": "integer" } }, "additionalProperties": false, "required": ["name", "age"], "propertyOrdering": ["name", "age"] } ``` This field is mutually exclusive with `parameters`. */
    parametersJsonSchema?: unknown;
    /** Optional. Describes the output from this function in JSON Schema format. Reflects the Open API 3.03 Response Object. The Schema defines the type used for the response value of the function. */
    response?: Schema;
    /** Optional. Describes the output from this function in JSON Schema format. The value specified by the schema is the response value of the function. This field is mutually exclusive with `response`. */
    responseJsonSchema?: unknown;
}

export declare interface Schema {
    /** Optional. The value should be validated against any (one or more) of the subschemas in the list. */
    anyOf?: Schema[];
    /** Optional. Default value of the data. */
    default?: unknown;
    /** Optional. The description of the data. */
    description?: string;
    /** Optional. Possible values of the element of primitive type with enum format. Examples: 1. We can define direction as : {type:STRING, format:enum, enum:["EAST", NORTH", "SOUTH", "WEST"]} 2. We can define apartment number as : {type:INTEGER, format:enum, enum:["101", "201", "301"]} */
    enum?: string[];
    /** Optional. Example of the object. Will only populated when the object is the root. */
    example?: unknown;
    /** Optional. The format of the data. Supported formats: for NUMBER type: "float", "double" for INTEGER type: "int32", "int64" for STRING type: "email", "byte", etc */
    format?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE ARRAY Schema of the elements of Type.ARRAY. */
    items?: Schema;
    /** Optional. Maximum number of the elements for Type.ARRAY. */
    maxItems?: string;
    /** Optional. Maximum length of the Type.STRING */
    maxLength?: string;
    /** Optional. Maximum number of the properties for Type.OBJECT. */
    maxProperties?: string;
    /** Optional. Maximum value of the Type.INTEGER and Type.NUMBER */
    maximum?: number;
    /** Optional. Minimum number of the elements for Type.ARRAY. */
    minItems?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE STRING Minimum length of the Type.STRING */
    minLength?: string;
    /** Optional. Minimum number of the properties for Type.OBJECT. */
    minProperties?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE INTEGER and NUMBER Minimum value of the Type.INTEGER and Type.NUMBER */
    minimum?: number;
    /** Optional. Indicates if the value may be null. */
    nullable?: boolean;
    /** Optional. Pattern of the Type.STRING to restrict a string to a regular expression. */
    pattern?: string;
    /** Optional. SCHEMA FIELDS FOR TYPE OBJECT Properties of Type.OBJECT. */
    properties?: Record<string, Schema>;
    /** Optional. The order of the properties. Not a standard field in open api spec. Only used to support the order of the properties. */
    propertyOrdering?: string[];
    /** Optional. Required properties of Type.OBJECT. */
    required?: string[];
    /** Optional. The title of the Schema. */
    title?: string;
    /** Optional. The type of the data. */
    type?: Type;
}
import type { AnyDeclarativeTool, OpenAIToolSchema, OpenAIFunctionCall } from './types';

/**
 * Central registry for managing tools
 */
export class ToolRegistry {
  private tools: Map<string, AnyDeclarativeTool> = new Map();

  /**
   * Register a tool in the registry
   */
  registerTool(tool: AnyDeclarativeTool): void {
    if (this.tools.has(tool.name)) {
      console.warn(
        `Tool with name "${tool.name}" is already registered. Overwriting.`,
      );
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Unregister a tool from the registry
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): AnyDeclarativeTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tool names
   */
  getAllToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Get all registered tools
   */
  getAllTools(): AnyDeclarativeTool[] {
    return Array.from(this.tools.values()).sort((a, b) =>
      a.displayName.localeCompare(b.displayName),
    );
  }

  /**
   * Get OpenAI tool schemas for all tools (primary format)
   */
  getToolSchemas(): OpenAIToolSchema[] {
    const schemas: OpenAIToolSchema[] = [];
    this.tools.forEach((tool) => {
      schemas.push(tool.schema);
    });
    return schemas;
  }

  /**
   * Get OpenAI tool schemas for specific tools (primary format)
   */
  getToolSchemasFiltered(toolNames: string[]): OpenAIToolSchema[] {
    const schemas: OpenAIToolSchema[] = [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) {
        schemas.push(tool.schema);
      }
    }
    return schemas;
  }

  /**
   * Get function declarations for all tools (backward compatibility)
   */
  getFunctionDeclarations(): FunctionDeclaration[] {
    const declarations: FunctionDeclaration[] = [];
    this.tools.forEach((tool) => {
      declarations.push((tool as any).genAISchema);
    });
    return declarations;
  }

  /**
   * Get function declarations for specific tools (backward compatibility)
   */
  getFunctionDeclarationsFiltered(toolNames: string[]): FunctionDeclaration[] {
    const declarations: FunctionDeclaration[] = [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) {
        declarations.push((tool as any).genAISchema);
      }
    }
    return declarations;
  }

  /**
   * Check if a tool is registered
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Clear all tools from the registry
   */
  clear(): void {
    this.tools.clear();
  }

  /**
   * Get tools by kind
   */
  getToolsByKind(kind: string): AnyDeclarativeTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.kind === kind);
  }

  /**
   * Get the number of registered tools
   */
  size(): number {
    return this.tools.size;
  }

  /**
   * Execute a tool by name with parameters
   */
  async executeTool(
    toolName: string,
    params: object,
    abortSignal: AbortSignal,
    updateOutput?: (output: string) => void,
  ) {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool '${toolName}' not found in registry`);
    }

    return tool.buildAndExecute(params, abortSignal, updateOutput);
  }

  /**
   * Validate tool parameters without executing
   */
  validateToolParams(toolName: string, params: object): string | null {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return `Tool '${toolName}' not found in registry`;
    }

    return tool.validateToolParams(params);
  }

  /**
   * Get OpenAI tool schemas for all tools (alias for primary format)
   */
  getOpenAIToolSchemas(): OpenAIToolSchema[] {
    return this.getToolSchemas();
  }

  /**
   * Get OpenAI tool schemas for specific tools (alias for primary format)
   */
  getOpenAIToolSchemasFiltered(toolNames: string[]): OpenAIToolSchema[] {
    return this.getToolSchemasFiltered(toolNames);
  }

  /**
   * Get OpenAI function calls for all tools
   */
  getOpenAIFunctionCalls(): OpenAIFunctionCall[] {
    const functionCalls: OpenAIFunctionCall[] = [];
    this.tools.forEach((tool) => {
      functionCalls.push((tool as any).openAIFunctionCall);
    });
    return functionCalls;
  }

  /**
   * Get OpenAI function calls for specific tools
   */
  getOpenAIFunctionCallsFiltered(toolNames: string[]): OpenAIFunctionCall[] {
    const functionCalls: OpenAIFunctionCall[] = [];
    for (const name of toolNames) {
      const tool = this.tools.get(name);
      if (tool) {
        functionCalls.push((tool as any).openAIFunctionCall);
      }
    }
    return functionCalls;
  }

  /**
   * Get a specific tool's schema (primary OpenAI format)
   */
  getToolSchema(toolName: string): OpenAIToolSchema | null {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return null;
    }
    return tool.schema;
  }

  /**
   * Get a specific tool's OpenAI tool schema (alias for primary format)
   */
  getToolOpenAISchema(toolName: string): OpenAIToolSchema | null {
    return this.getToolSchema(toolName);
  }

  /**
   * Get a specific tool's OpenAI function call
   */
  getToolOpenAIFunctionCall(toolName: string): OpenAIFunctionCall | null {
    const tool = this.tools.get(toolName);
    if (!tool) {
      return null;
    }
    return (tool as any).openAIFunctionCall;
  }
}