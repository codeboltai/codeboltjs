import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryJsonUpdateNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/json/update",
    title: "Memory JSON Update",
    category: "codebolt/memory/json",
    description: "Update JSON data in memory by ID",
    icon: "📝",
    color: "#FF7043"
  };

  constructor() {
    super(BaseMemoryJsonUpdateNode.metadata, [380, 220]);
    this.addProperty("memoryId", "", "string");
    this.addProperty("json", "{}", "string");
    this.addInput("memoryId", "string");
    this.addInput("json", "object");
  }
}
