import { NodeMetadata } from '../../../types';
import { BaseMemoryActionNode } from './BaseMemoryActionNode';

export class BaseMemoryJsonSaveNode extends BaseMemoryActionNode {
  static metadata: NodeMetadata = {
    type: "codebolt/memory/json/save",
    title: "Memory JSON Save",
    category: "codebolt/memory/json",
    description: "Save JSON data into memory storage",
    icon: "🧾",
    color: "#FF7043"
  };

  constructor() {
    super(BaseMemoryJsonSaveNode.metadata, [360, 200]);
    this.addProperty("json", "{}", "string");
    this.addInput("json", "object");
  }
}
