import { PowerNode } from './nodes/PowerNode';
import { ModuloNode } from './nodes/ModuloNode';
import { RangeNode } from './nodes/RangeNode';

/**
 * Register plugin UI nodes with LiteGraph
 */
export const registerNodes = (LiteGraph: any) => {
  console.log('Registering Enhanced Math plugin nodes...');

  // Register PowerNode
  LiteGraph.registerNodeType("math/power", PowerNode);
  console.log('Registered PowerNode');

  // Register ModuloNode
  LiteGraph.registerNodeType("math/modulo", ModuloNode);
  console.log('Registered ModuloNode');

  // Register RangeNode
  LiteGraph.registerNodeType("math/range", RangeNode);
  console.log('Registered RangeNode');

  console.log('Enhanced Math plugin nodes registered successfully');
};

// Export node classes for potential direct usage
export {
  PowerNode,
  ModuloNode,
  RangeNode
};