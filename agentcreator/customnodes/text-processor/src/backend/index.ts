import { SplitTextNodeHandler } from './processors/SplitTextNode';
import { JoinTextNodeHandler } from './processors/JoinTextNode';
import { ReplaceTextNodeHandler } from './processors/ReplaceTextNode';
import { FormatTextNodeHandler } from './processors/FormatTextNode';

/**
 * Register plugin backend handlers with agent manager
 */
export const registerHandlers = (agentManager: any) => {
  console.log('Registering Text Processing plugin handlers...');

  // Register SplitTextNode handler
  agentManager.registerHandler("text/split", {
    execute: SplitTextNodeHandler.execute
  });
  console.log('Registered SplitTextNode handler');

  // Register JoinTextNode handler
  agentManager.registerHandler("text/join", {
    execute: JoinTextNodeHandler.execute
  });
  console.log('Registered JoinTextNode handler');

  // Register ReplaceTextNode handler
  agentManager.registerHandler("text/replace", {
    execute: ReplaceTextNodeHandler.execute
  });
  console.log('Registered ReplaceTextNode handler');

  // Register FormatTextNode handler
  agentManager.registerHandler("text/format", {
    execute: FormatTextNodeHandler.execute
  });
  console.log('Registered FormatTextNode handler');

  console.log('Text Processing plugin handlers registered successfully');
};

// Export handlers for potential direct usage
export {
  SplitTextNodeHandler,
  JoinTextNodeHandler,
  ReplaceTextNodeHandler,
  FormatTextNodeHandler
};