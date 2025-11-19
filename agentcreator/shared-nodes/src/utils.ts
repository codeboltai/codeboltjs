// Type definitions for the utilities
import { LiteGraph } from '@codebolt/litegraph';
import { NodeMetadata } from './types';
import { PluginValidator } from './PluginValidator';

// Utility function to register node types with metadata
export function registerNodeWithMetadata(LiteGraph, NodeClass, metadata: NodeMetadata) {
  if (!metadata || !metadata.type) {
    console.error('Invalid metadata provided for node:', NodeClass.name, metadata);
    return;
  }
  LiteGraph.registerNodeType(metadata.type, NodeClass);
  NodeClass.title = metadata.title;
  NodeClass.category = metadata.category;
}

// Export PluginValidator for use in plugin loading
export { PluginValidator };