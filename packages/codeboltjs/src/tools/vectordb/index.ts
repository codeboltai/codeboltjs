/**
 * Vector database tools
 */

// Export tool classes and their parameter types
export { VectorGetTool, type VectorGetToolParams } from './vector-get';
export { VectorAddItemTool, type VectorAddItemToolParams } from './vector-add-item';
export { VectorQueryTool, type VectorQueryToolParams } from './vector-query';
export { VectorQueryItemsTool, type VectorQueryItemsToolParams } from './vector-query-items';

// Import for creating tool instances
import { VectorGetTool } from './vector-get';
import { VectorAddItemTool } from './vector-add-item';
import { VectorQueryTool } from './vector-query';
import { VectorQueryItemsTool } from './vector-query-items';

/**
 * All vector database tools
 */
export const vectordbTools = [
    new VectorGetTool(),
    new VectorAddItemTool(),
    new VectorQueryTool(),
    new VectorQueryItemsTool(),
];
