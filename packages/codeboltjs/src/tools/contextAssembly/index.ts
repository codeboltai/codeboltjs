/**
 * Context Assembly Tools
 * 
 * Tools for context building for agents.
 */

export { ContextGetTool } from './context-get';
export { ContextValidateTool } from './context-validate';
export { ContextListMemoryTypesTool } from './context-list-memory-types';
export { ContextEvaluateRulesTool } from './context-evaluate-rules';
export { ContextGetRequiredVariablesTool } from './context-get-required-variables';

import { ContextGetTool } from './context-get';
import { ContextValidateTool } from './context-validate';
import { ContextListMemoryTypesTool } from './context-list-memory-types';
import { ContextEvaluateRulesTool } from './context-evaluate-rules';
import { ContextGetRequiredVariablesTool } from './context-get-required-variables';

/**
 * Array of all context assembly tools
 */
export const contextAssemblyTools = [
    new ContextGetTool(),
    new ContextValidateTool(),
    new ContextListMemoryTypesTool(),
    new ContextEvaluateRulesTool(),
    new ContextGetRequiredVariablesTool(),
];
