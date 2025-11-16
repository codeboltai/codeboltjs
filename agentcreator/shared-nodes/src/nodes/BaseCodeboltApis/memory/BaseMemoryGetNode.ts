import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryGetNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/get",
    title: "Memory Get",
    category: "codebolt/memory",
    description: "Retrieves a value by key from memory store",
    icon: "🔍",
    color: "#FFB300"
  };

  constructor() {
    super(BaseMemoryGetNode.metadata, [320, 180]);
    this.addProperty("key", "", "string");
    this.addInput("key", "string");
    this.addOutput("value", "string");
  }
}
