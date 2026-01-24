/**
 * LLM tools
 */

export { LLMInferenceTool, type LLMInferenceToolParams, type LLMMessage, type LLMTool } from './llm-inference';
export { LLMGetConfigTool, type LLMGetConfigToolParams } from './llm-get-config';

// Create instances for convenience
import { LLMInferenceTool } from './llm-inference';
import { LLMGetConfigTool } from './llm-get-config';

/**
 * All LLM tools
 */
export const llmTools = [
    new LLMInferenceTool(),
    new LLMGetConfigTool(),
];
