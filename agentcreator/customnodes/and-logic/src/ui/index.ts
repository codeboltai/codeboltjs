import { AndNode } from './nodes/AndNode';

/**
 * Register plugin UI nodes with LiteGraph
 */
export const registerNodes = (LiteGraph: any) => {
  console.log('Registering AND Logic plugin nodes...');

  // Register AndNode
  LiteGraph.registerNodeType("logic/AND", AndNode);
  console.log('Registered AndNode');

  console.log('AND Logic plugin nodes registered successfully');
};

// Export node classes for potential direct usage
export {
  AndNode
};