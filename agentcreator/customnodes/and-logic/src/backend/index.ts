import { AndNodeHandler } from './processors/AndNode';

/**
 * Register plugin backend handlers with agent manager
 */
export const registerHandlers = (agentManager: any) => {
  console.log('Registering AND Logic plugin handlers...');

  // Register AndNode handler
  agentManager.registerHandler("logic/AND", {
    execute: AndNodeHandler.execute
  });
  console.log('Registered AndNode handler');

  console.log('AND Logic plugin handlers registered successfully');
};

// Export handlers for potential direct usage
export {
  AndNodeHandler
};