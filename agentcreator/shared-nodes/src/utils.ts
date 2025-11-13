// Type definitions for the utilities
import { LiteGraph } from '@comfyorg/litegraph';

export interface NodeMetadata {
  type: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  color: string;
}

// Import the runtime implementation
export { nodeMetadata, registerNodeWithMetadata } from './utils-impl';