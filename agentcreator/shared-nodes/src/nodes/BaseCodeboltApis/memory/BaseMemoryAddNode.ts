import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryAddNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/add",
    title: "Memory Add",
    category: "codebolt/memory",
    description: "Adds a key/value pair to memory store",
    icon: "➕",
    color: "#FFB300"
  };

  constructor() {
    super(BaseMemoryAddNode.metadata, [320, 200]);
    this.addProperty("key", "", "string");
    this.addProperty("value", "", "string");
    this.addInput("key", "string");
    this.addInput("value", "string");
  }
}
