import { LGraphNode } from '@codebolt/litegraph';
import { NodeMetadata } from '../../types/NodeMetadata';

export class BaseFloorNode extends LGraphNode {
  static metadata: NodeMetadata = {
    type: "math/floor",
    title: "Floor",
    category: "math",
    description: "Floor number to remove fractional part",
    icon: "⌊",
    color: "#2196F3"
  };

  constructor() {
    super(BaseFloorNode.metadata.title, BaseFloorNode.metadata.type);
    this.title = BaseFloorNode.metadata.title;
    this.addInput("in", "number");
    this.addOutput("out", "number");
    this.size = [80, 30];
  }

  // Shared floor logic
  floor(value: any): number {
    const num = value !== undefined ? Number(value) : 0;
    return Math.floor(num);
  }
}