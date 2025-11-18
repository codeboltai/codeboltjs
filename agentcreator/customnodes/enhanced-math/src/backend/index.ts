import { PowerNodeHandler } from './processors/PowerNode';
import { ModuloNodeHandler } from './processors/ModuloNode';
import { RangeNodeHandler } from './processors/RangeNode';

/**
 * Register plugin backend handlers with agent manager
 */
export const registerHandlers = (agentManager: any) => {
  console.log('Registering Enhanced Math plugin handlers...');

  // Register PowerNode handler
  agentManager.registerHandler("math/power", {
    execute: PowerNodeHandler.execute
  });
  console.log('Registered PowerNode handler');

  // Register ModuloNode handler
  agentManager.registerHandler("math/modulo", {
    execute: ModuloNodeHandler.execute
  });
  console.log('Registered ModuloNode handler');

  // Register RangeNode handler
  agentManager.registerHandler("math/range", {
    execute: RangeNodeHandler.execute
  });
  console.log('Registered RangeNode handler');

  console.log('Enhanced Math plugin handlers registered successfully');
};

// Export handlers for potential direct usage
export {
  PowerNodeHandler,
  ModuloNodeHandler,
  RangeNodeHandler
};