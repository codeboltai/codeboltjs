/**
 * Pre-Tool Call Processors
 * 
 * These processors run before tool execution and can intercept, validate,
 * or modify tool calls before they are sent to the actual tool execution engine.
 */

// Local tool interceptor
export { 
    LocalToolInterceptorProcessor,
    type LocalToolInterceptorInfo,
    type LocalToolInterceptorProcessorOptions,
    type LocalToolHandler
} from './localToolInterceptorProcessor';

// Tool validation processor
export { 
    ToolValidationProcessor,
    type ToolValidationInfo,
    type ToolValidationProcessorOptions
} from './toolValidationProcessor';

// Tool parameter modifier processor
export { 
    ToolParameterModifierProcessor,
    type ToolParameterModificationInfo,
    type ParameterTransformation,
    type ToolParameterModifierProcessorOptions
} from './toolParameterModifierProcessor';
