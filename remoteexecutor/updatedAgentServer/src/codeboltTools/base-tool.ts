/**
 * Base classes for tool implementations
 */

//import type { FunctionDeclaration } from '@google/generative-ai';
import type {
  ToolBuilder,
  ToolInvocation,
  ToolResult,
  ToolLocation,
  ToolCallConfirmationDetails,
  Kind,
  OpenAIToolSchema,
  OpenAIFunctionCall,
} from './types';
import { ToolErrorType } from './types';

// Re-export types for convenience
export type {
  ToolInvocation,
  ToolResult,
  ToolLocation,
  ToolCallConfirmationDetails,
} from './types';

// Re-export Kind as both type and value
export { Kind } from './types';
import { SchemaValidator } from './utils/schema-validator';

/**
 * A convenience base class for ToolInvocation
 */
export abstract class BaseToolInvocation<
  TParams extends object,
  TResult extends ToolResult,
> implements ToolInvocation<TParams, TResult> {
  constructor(readonly params: TParams) { }

  abstract getDescription(): string;

  toolLocations(): ToolLocation[] {
    return [];
  }

  shouldConfirmExecute(
    _abortSignal: AbortSignal,
  ): Promise<ToolCallConfirmationDetails | false> {
    return Promise.resolve(false);
  }

  abstract execute(
    signal: AbortSignal,
    updateOutput?: (output: string) => void,
  ): Promise<TResult>;
}

/**
 * New base class for tools that separates validation from execution
 */
export abstract class DeclarativeTool<
  TParams extends object,
  TResult extends ToolResult,
> implements ToolBuilder<TParams, TResult> {
  constructor(
    readonly name: string,
    readonly displayName: string,
    readonly description: string,
    readonly kind: Kind,
    readonly parameterSchema: unknown,
    readonly isOutputMarkdown: boolean = true,
    readonly canUpdateOutput: boolean = false,
  ) { }

  /**
   * Primary schema format (OpenAI tool schema)
   */
  get schema(): OpenAIToolSchema {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties: (this.parameterSchema as any)?.properties || {},
          required: (this.parameterSchema as any)?.required || [],
          additionalProperties: false,
        },
      },
    };
  }

  /**
   * Get OpenAI function call format
   */
  get openAIFunctionCall(): OpenAIFunctionCall {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: (this.parameterSchema as any)?.properties || {},
        required: (this.parameterSchema as any)?.required || [],
        additionalProperties: false,
      },
    };
  }

  /**
   * Get Google GenAI schema format (for backward compatibility)
   */
  get genAISchema(): FunctionDeclaration {
    return {
      name: this.name,
      description: this.description,
      parameters: this.parameterSchema as any,
    };
  }

  /**
   * Validates the raw tool parameters.
   * Subclasses should override this to add custom validation logic
   * beyond the JSON schema check.
   */
  validateToolParams(_params: TParams): string | null {
    return null;
  }

  /**
   * The core of the new pattern. It validates parameters and, if successful,
   * returns a `ToolInvocation` object that encapsulates the logic for the
   * specific, validated call.
   */
  abstract build(params: TParams): ToolInvocation<TParams, TResult>;

  /**
   * A convenience method that builds and executes the tool in one step.
   */
  async buildAndExecute(
    params: TParams,
    signal: AbortSignal,
    updateOutput?: (output: string) => void,
  ): Promise<TResult> {
    const invocation = this.build(params);
    return invocation.execute(signal, updateOutput);
  }

  /**
   * Similar to `build` but never throws.
   */
  private silentBuild(
    params: TParams,
  ): ToolInvocation<TParams, TResult> | Error {
    try {
      return this.build(params);
    } catch (e) {
      if (e instanceof Error) {
        return e;
      }
      return new Error(String(e));
    }
  }

  /**
   * A convenience method that builds and executes the tool in one step.
   * Never throws.
   */
  async validateBuildAndExecute(
    params: TParams,
    abortSignal: AbortSignal,
  ): Promise<ToolResult> {
    const invocationOrError = this.silentBuild(params);
    if (invocationOrError instanceof Error) {
      const errorMessage = invocationOrError.message;
      return {
        llmContent: `Error: Invalid parameters provided. Reason: ${errorMessage}`,
        returnDisplay: errorMessage,
        error: {
          message: errorMessage,
          type: ToolErrorType.INVALID_TOOL_PARAMS,
        },
      };
    }

    try {
      return await invocationOrError.execute(abortSignal);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return {
        llmContent: `Error: Tool call execution failed. Reason: ${errorMessage}`,
        returnDisplay: errorMessage,
        error: {
          message: errorMessage,
          type: ToolErrorType.EXECUTION_FAILED,
        },
      };
    }
  }
}

/**
 * Base class for declarative tools with built-in validation
 */
export abstract class BaseDeclarativeTool<
  TParams extends object,
  TResult extends ToolResult,
> extends DeclarativeTool<TParams, TResult> {
  build(params: TParams): ToolInvocation<TParams, TResult> {
    const validationError = this.validateToolParams(params);
    if (validationError) {
      throw new Error(validationError);
    }
    return this.createInvocation(params);
  }

  override validateToolParams(params: TParams): string | null {
    const errors = SchemaValidator.validate(
      this.schema.function.parameters,
      params,
    );

    if (errors) {
      return errors;
    }
    return this.validateToolParamValues(params);
  }

  protected validateToolParamValues(_params: TParams): string | null {
    return null;
  }

  protected abstract createInvocation(
    params: TParams,
  ): ToolInvocation<TParams, TResult>;
}