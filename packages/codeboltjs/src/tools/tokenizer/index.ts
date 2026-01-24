/**
 * Tokenizer tools - Individual tools for each tokenizer action
 */

// Individual tokenizer tools
export { TokenizerAddTool, type TokenizerAddParams } from './tokenizer-add';
export { TokenizerGetTool, type TokenizerGetParams } from './tokenizer-get';

// Create instances for convenience
import { TokenizerAddTool } from './tokenizer-add';
import { TokenizerGetTool } from './tokenizer-get';

/**
 * All tokenizer tools
 */
export const tokenizerTools = [
    new TokenizerAddTool(),
    new TokenizerGetTool(),
];
