import { SplitTextNode } from './nodes/SplitTextNode';
import { JoinTextNode } from './nodes/JoinTextNode';
import { ReplaceTextNode } from './nodes/ReplaceTextNode';
import { FormatTextNode } from './nodes/FormatTextNode';

/**
 * Register plugin UI nodes with LiteGraph
 */
export const registerNodes = (LiteGraph: any) => {
  console.log('Registering Text Processing plugin nodes...');

  // Register SplitTextNode
  LiteGraph.registerNodeType("text/split", SplitTextNode);
  console.log('Registered SplitTextNode');

  // Register JoinTextNode
  LiteGraph.registerNodeType("text/join", JoinTextNode);
  console.log('Registered JoinTextNode');

  // Register ReplaceTextNode
  LiteGraph.registerNodeType("text/replace", ReplaceTextNode);
  console.log('Registered ReplaceTextNode');

  // Register FormatTextNode
  LiteGraph.registerNodeType("text/format", FormatTextNode);
  console.log('Registered FormatTextNode');

  console.log('Text Processing plugin nodes registered successfully');
};

// Export node classes for potential direct usage
export {
  SplitTextNode,
  JoinTextNode,
  ReplaceTextNode,
  FormatTextNode
};